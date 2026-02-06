from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Website(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    url = models.URLField()
    name = models.CharField(max_length=255, blank=True)
    last_scanned = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Report(models.Model):
    website = models.ForeignKey(Website, on_delete=models.CASCADE, related_name="reports")
    tracker_count = models.IntegerField(default=0)
    cookie_count = models.IntegerField(default=0)
    third_party_scripts = models.JSONField(default=list)
    headers = models.JSONField(default=dict)
    privacy_score = models.FloatField()
    grade = models.CharField(max_length=1)
    evidence = models.JSONField(default=dict)
    scanned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
