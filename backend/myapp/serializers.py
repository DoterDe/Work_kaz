from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()
from rest_framework import serializers
from .models import Lesson, LessonProgress

class LessonSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_progress(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return 0
        progress = LessonProgress.objects.filter(user=user, lesson=obj).first()
        return progress.progress if progress else 0

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


