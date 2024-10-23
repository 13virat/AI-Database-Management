from django.db import models

class QueryLog(models.Model):
    query_text = models.TextField()
    execution_time = models.FloatField()  # store execution time in seconds
    records_processed = models.IntegerField(default=0)  # number of records affected by the query
    indexes_used = models.TextField(blank=True, null=True)  # track if any indexes were used
    columns_accessed = models.TextField(blank=True, null=True)  # New field to track columns
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.query_text
