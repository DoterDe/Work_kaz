from django.db import migrations

def create_superuser(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    
    # Проверяем, не существует ли уже пользователь
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='Aboka2008'  # ← замените на реальный пароль!
        )
        print("✅ Суперпользователь создан")
    else:
        print("ℹ️ Суперпользователь уже существует")

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0004_create_initial_superuser.py'),  # ← ссылка на предыдущую миграцию
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]