from django.db import migrations

def create_superuser(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='Aboka2008'
        )
        print("✅ Суперпользователь создан")
    else:
        print("ℹ️ Суперпользователь уже существует")

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0003_auditlog_vocabularyquizattempt'),  # ← ПРОВЕРЬТЕ ЭТО
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]