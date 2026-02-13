from rest_framework import viewsets, permissions
from .models import Website, Report
from .serializers import WebsiteSerializer, ReportSerializer, UserSerializer, RegisterSerializer
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .tasks import scan_website_task
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView

from rest_framework.permissions import AllowAny

class LoginAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response({"detail": "Invalid credentials"}, status=400)

        login(request, user)
        return Response({"detail": "Logged in", "username": user.username})

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "message": "User Created Successfully.  Now perform Login to get your token",
        })

class WebsiteViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Website.objects.filter(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def scan(self, request, pk=None):
        website = self.get_object()
        from .scraper import is_allowed_target
        allowed, message = is_allowed_target(website.url)
        if not allowed:
            return Response({"detail": f"Scan failed: {message}"}, status=400)
            
        scan_website_task.delay(website.id)
        return Response({"message": "Scan started"})

    def perform_create(self, serializer):
        # Set the owner automatically from the authenticated user
        serializer.save(owner=self.request.user)

class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        website_id = self.request.query_params.get('website')
        return Report.objects.filter(website__owner=self.request.user, website_id=website_id)
