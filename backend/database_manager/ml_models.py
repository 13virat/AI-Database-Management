import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from database_manager.models import QueryLog

def train_query_optimization_model():
    # Collecting query logs data
    query_logs = QueryLog.objects.all()
    X = []
    y = []

    # Extract features (e.g., records processed, indexes used, execution time)
    for log in query_logs:
        features = [
            log.records_processed,
            1 if log.indexes_used else 0,  # Binary feature for index usage
            # You can add more complex features here
        ]
        X.append(features)
        y.append(log.execution_time)  # Predicting execution time

    X = np.array(X)
    y = np.array(y)

    # Split the dataset into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train the model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Optionally: Save the model for reuse
    return model

def predict_query_optimization(query_log):
    # Load trained model (or pass it directly)
    model = train_query_optimization_model()
    
    # Predict for the new query
    features = [
        query_log.records_processed,
        1 if query_log.indexes_used else 0,
    ]
    predicted_execution_time = model.predict([features])

    # Simple threshold: If predicted time is too high, suggest optimization
    if predicted_execution_time > 1:  # Arbitrary threshold for "slow query"
        return "Consider adding indexes or optimizing the query structure."
    return "Query is optimized."
