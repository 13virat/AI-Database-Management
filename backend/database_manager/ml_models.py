import numpy as np
import joblib
import logging
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from database_manager.models import QueryLog

# Path to store the trained model
MODEL_PATH = 'query_optimization_model.pkl'

logger = logging.getLogger(__name__)

def train_query_optimization_model():
    """Train the query optimization model on the collected query logs."""
    # Collect query logs data
    query_logs = QueryLog.objects.all()
    X, y = [], []

    for log in query_logs:
        # Extract features for training
        features = [
            log.records_processed,
            1 if log.indexes_used else 0  # Binary feature for index usage
        ]
        X.append(features)
        y.append(log.execution_time)

    X, y = np.array(X), np.array(y)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train the model
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Save the trained model
    joblib.dump(model, MODEL_PATH)
    logger.info("Model trained and saved successfully.")
    return model


def load_model():
    """Load the trained model, or train a new one if not available."""
    try:
        model = joblib.load(MODEL_PATH)
        logger.info("Loaded trained model from file.")
    except FileNotFoundError:
        logger.warning("Model not found, training a new model.")
        model = train_query_optimization_model()
    return model


def predict_query_optimization(query_log):
    """Use the trained model to predict if the query needs optimization."""
    model = load_model()

    features = [
        query_log.records_processed,
        1 if query_log.indexes_used else 0
    ]

    try:
        predicted_execution_time = model.predict([features])
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return f"Prediction failed: {e}"

    if predicted_execution_time > 1:  # Threshold for "slow query"
        return "Consider adding indexes or optimizing the query structure."
    
    return "Query is optimized."


def suggest_schema_migrations():
    """Analyze query logs and suggest schema migrations based on usage frequency."""
    query_logs = QueryLog.objects.all()
    column_usage = {}

    for log in query_logs:
        if log.columns_accessed:
            logger.info(f"Processing columns accessed in query: {log.columns_accessed}")
            columns = log.columns_accessed.split(',')
            for column in columns:
                column = column.strip()
                if column:
                    column_usage[column] = column_usage.get(column, 0) + 1

    logger.info(f"Column usage data: {column_usage}")

    # Suggest adding indexes for frequently accessed columns (e.g., accessed 1 or more times)
    suggestions = [f"Consider adding an index on column '{column}'" for column, count in column_usage.items() if count >= 1]

    logger.info(f"Generated schema suggestions: {suggestions}")
    return suggestions
