from django.contrib import admin
from django.urls import path
from database_manager.views import QueryLogView

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/query-log/', QueryLogView.as_view(), name='query-log'),
]

