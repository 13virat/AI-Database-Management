from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import QueryLog
from database_manager.ml_models import predict_query_optimization, suggest_schema_migrations


class QueryLogView(APIView):
    """API to handle logging of queries and providing optimization suggestions."""
    def get(self, request):
        # Fetch all queries and compute optimization suggestions
        queries = QueryLog.objects.all()
        result = [{
            'query_text': query.query_text,
            'execution_time': query.execution_time,
            'records_processed': query.records_processed,
            'indexes_used': query.indexes_used,
            'columns_accessed': query.columns_accessed,
            'created_at': query.created_at,
            'optimization_suggestion': predict_query_optimization(query)
        } for query in queries]
        
        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        query_data = request.data
        
        # Validation: Ensure that necessary fields are present and valid
        if not query_data.get('query_text') or not query_data.get('execution_time'):
            return Response({"error": "Query text and execution time are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            execution_time = float(query_data.get('execution_time'))
            if execution_time <= 0:
                raise ValueError("Execution time must be positive.")
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Create and save QueryLog entry
        query = QueryLog.objects.create(
            query_text=query_data.get('query_text'),
            execution_time=execution_time,
            records_processed=query_data.get('records_processed', 0),
            indexes_used=query_data.get('indexes_used', ''),
            columns_accessed=query_data.get('columns_accessed', '')
        )

        # Generate optimization suggestion
        try:
            optimization_suggestion = predict_query_optimization(query)
        except Exception as e:
            return Response({
                "error": "Error in optimization prediction",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "query": query.query_text,
            "optimization_suggestion": optimization_suggestion
        }, status=status.HTTP_201_CREATED)


class SchemaMigrationSuggestionView(APIView):
    """API to provide schema migration suggestions based on query logs."""
    def get(self, request):
        suggestions = suggest_schema_migrations()
        return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)
