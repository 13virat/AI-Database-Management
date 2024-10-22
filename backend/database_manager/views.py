from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import QueryLog
from database_manager.ml_models import predict_query_optimization

class QueryLogView(APIView):
    def get(self, request):
        # Fetch all queries and compute optimization suggestions on the fly
        queries = QueryLog.objects.all()
        result = []
        for query in queries:
            optimization_suggestion = predict_query_optimization(query)
            result.append({
                'query_text': query.query_text,
                'execution_time': query.execution_time,
                'records_processed': query.records_processed,
                'indexes_used': query.indexes_used,
                'created_at': query.created_at,
                'optimization_suggestion': optimization_suggestion,  # Add suggestion here
            })
        return Response(result, status=status.HTTP_200_OK)

    def post(self, request):
        query_data = request.data
        
        # Ensure that necessary fields are present in the request
        if not query_data.get('query_text') or not query_data.get('execution_time'):
            return Response({"error": "Query text and execution time are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a QueryLog entry
        query = QueryLog.objects.create(
            query_text=query_data.get('query_text'),
            execution_time=query_data.get('execution_time'),
            records_processed=query_data.get('records_processed', 0),
            indexes_used=query_data.get('indexes_used', '')
        )

        # Call the optimization suggestion function
        try:
            optimization_suggestion = predict_query_optimization(query)
        except Exception as e:
            # Handle any errors from the ML model
            return Response({
                "error": "Error in optimization prediction",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Return the logged query and the optimization suggestion
        return Response({
            "query": query.query_text,
            "optimization_suggestion": optimization_suggestion
        }, status=status.HTTP_201_CREATED)
