# 🚀 Deployment Guide: Django + React/Vercel + Supabase

## 1. Краткий вывод по текущему репозиторию

### Что уже есть

- ✅ Django API с JWT-аутентификацией
- ✅ Набор API для уроков, словаря, тестов, прогресса и контент-студии
- ✅ SQLite-файл для локальной разработки: `backend/db.sqlite3`
- ✅ Фронтенд уже умеет работать с API через `axios`

### Что важно знать прямо сейчас

| Область | Что найдено в репозитории | Почему это важно |
| --- | --- | --- |
| Backend | `backend/myproject/settings.py` | Это главный файл для БД, CORS, security, static files |
| API | `backend/myproject/urls.py`, `backend/myapp/urls.py`, `backend/myapp/views.py` | Тут все публичные и защищённые маршруты |
| Frontend | `frontend/package.json`, `frontend/src/api/axios.ts`, `frontend/src/main.tsx` | Тут build, env-переменные, Google login |
| Frontend framework | В текущем коде это **Vite/React**, а не Next.js | На Vercel деплой будет как Vite SPA, не как Next app |
| Extra folders | Есть `design/`, корневой `src/`, корневой `package.json` | Можно случайно выбрать не тот root directory при деплое |

### Главные риски, которые были найдены

1. В репозитории были жёстко зашиты локальные URL API и Google OAuth client id.
2. Конфиг Django был частично ориентирован на PostgreSQL, хотя локально у вас есть SQLite.
3. Не было production-файлов для Render: `requirements.txt`, `Procfile`, `build.sh`.
4. Не было `.env.example` для фронтенда.
5. Есть несколько фронтенд-подобных директорий, что повышает шанс задеплоить не тот проект.

### Что уже подготовлено в репозитории

- `backend/myproject/settings.py` обновлён под env-переменные, SQLite-local и PostgreSQL-production
- `frontend/src/api/axios.ts` переведён на `VITE_API_BASE_URL`
- `frontend/src/main.tsx` переведён на `VITE_GOOGLE_CLIENT_ID`
- `backend/.env.example`
- `frontend/.env.example`
- `backend/requirements.txt`
- `backend/Procfile`
- `backend/build.sh`
- `frontend/vercel.json`
- `.github/workflows/deploy.yml`
- `backend/Dockerfile`
- `scripts/post-deploy-check.ps1`

## 2. Рекомендуемая схема деплоя

### Самый простой путь для вашего текущего репозитория

- Frontend: **Vercel**
- Backend: **Render Web Service**
- Database: **Supabase Postgres**

### Почему именно так

- Vercel очень удобен для frontend и бесплатного demo URL.
- Render хорошо подходит для Django и умеет тянуть проект из GitHub.
- Supabase даёт управляемый Postgres и удобную панель.

### Важное ограничение по free tier

- Render официально пишет, что Free web service засыпает после **15 минут без трафика**, а следующий запуск может занимать около **1 минуты**.
- Render также предупреждает, что локальная файловая система эфемерна, поэтому **SQLite на Render использовать нельзя**.
- Supabase рекомендует для persistent backend использовать direct connection, но direct connection по умолчанию IPv6-only. Если ваше окружение упирается в IPv4, используйте **Supavisor session mode**.

## 3. Какие файлы и настройки проверять перед деплоем

### Backend

- `backend/myproject/settings.py`
- `backend/myproject/urls.py`
- `backend/myapp/urls.py`
- `backend/myapp/views.py`
- `backend/myapp/models.py`
- `backend/requirements.txt`
- `backend/build.sh`
- `backend/Procfile`
- `backend/.env.example`

### Frontend

- `frontend/package.json`
- `frontend/vercel.json`
- `frontend/vite.config.ts`
- `frontend/.env.example`
- `frontend/src/api/axios.ts`
- `frontend/src/main.tsx`

### Git / Repo hygiene

- `.gitignore`
- не коммитить `.env`
- не хранить SQLite как production БД
- не хранить `build/`, `node_modules/`, `__pycache__/`

## 4. Потенциальные production-проблемы

1. Неверный `root directory` в Vercel или Render.
2. Неправильные `ALLOWED_HOSTS`.
3. Неправильные `CORS_ALLOWED_ORIGINS`.
4. Отсутствие `CSRF_TRUSTED_ORIGINS`.
5. Неверный `VITE_API_BASE_URL`.
6. Google OAuth origin не добавлен в Google Cloud Console.
7. Попытка использовать SQLite в облаке.
8. Отсутствие `collectstatic`.
9. Неприменённые миграции.
10. Неверные DB credentials Supabase.
11. Использование direct Supabase connection там, где доступен только IPv4.
12. Render free sleep и долгий первый ответ.

## 5. Улучшения для production-ready версии

- Включить WhiteNoise для статических файлов Django.
- Логировать ошибки в stdout и подключить Sentry.
- Хранить все URL и ключи только в env-переменных.
- Добавить GitHub Actions.
- Добавить post-deploy smoke checks.
- Добавить периодический off-site backup базы.
- Переехать на Redis cache при росте нагрузки.
- Добавить пагинацию в list endpoints.

## 6. Перенос SQLite → Supabase PostgreSQL

### Вариант, который я рекомендую

Для Django-проекта проще и безопаснее переносить данные через:

1. `migrate` для создания таблиц в Postgres
2. `dumpdata` из SQLite
3. `loaddata` в Supabase

Так вы не пишете SQL вручную и не рискуете сломать связи между моделями.

### Шаг 1. Сделайте локальный backup SQLite

```powershell
Set-Location backend
Copy-Item db.sqlite3 db.sqlite3.backup
```

### Шаг 2. Экспортируйте данные из SQLite

```powershell
Set-Location backend
$env:USE_SQLITE="True"
$env:SQLITE_NAME="db.sqlite3"
python manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission --indent 2 --output data.json
```

### Если здесь появляется ошибка `no such table: myapp_lesson`

Это значит, что SQLite-файл найден, но миграции приложения `myapp` в нём ещё не применялись.

Сначала выполните:

```powershell
Set-Location backend
$env:USE_SQLITE="True"
$env:SQLITE_NAME="db.sqlite3"
python manage.py showmigrations
python manage.py migrate
```

Потом снова:

```powershell
python manage.py dumpdata --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission --indent 2 --output data.json
```

Важно:

- если вы уже находитесь в `backend`, не нужно ещё раз писать `Set-Location backend`
- команда `Set-Location backend` из папки `backend` ошибочно попытается открыть `backend/backend`
- в `Windows PowerShell` не используйте `set NAME=value`, используйте `$env:NAME="value"`
- для `dumpdata` в `Windows PowerShell` безопаснее использовать `--output data.json`, а не `>`
- если после `migrate` счётчики данных равны нулю, значит схема создалась, но контент в локальную SQLite ещё не был загружен

### Шаг 3. Создайте проект в Supabase

1. Откройте `https://supabase.com/dashboard`
2. Создайте новый project
3. Задайте database password
4. После создания проекта откройте `Connect`
5. Скопируйте:
- host
- database name
- user
- password
- port
- при необходимости session pooler connection string

### Шаг 4. Выберите способ подключения Django

#### Вариант A. Через отдельные переменные

```env
USE_SQLITE=False
DB_ENGINE=django.db.backends.postgresql
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_SSLMODE=require
```

#### Вариант B. Через `DATABASE_URL`

```env
DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
DB_SSLMODE=require
USE_SQLITE=False
```

### Какой вариант выбрать

- Если Render/Supabase direct connection работает: используйте direct connection
- Если у вас возникают IPv6/IPv4 проблемы: используйте **Supavisor session mode**

### Шаг 5. Создайте таблицы в Supabase через Django migrations

```powershell
Set-Location backend
$env:USE_SQLITE="False"
$env:DATABASE_URL="postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres"
$env:DB_SSLMODE="require"
python manage.py migrate
```

### Нужны ли SQL-скрипты для создания таблиц?

Обычно **нет**. В вашем случае таблицы должны создаваться через Django migrations.

### Шаг 6. Импортируйте данные

```powershell
Set-Location backend
$env:USE_SQLITE="False"
$env:DATABASE_URL="postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres"
$env:DB_SSLMODE="require"
python manage.py loaddata data.json
```

### Шаг 7. Проверьте результат

```powershell
Set-Location backend
python manage.py shell
```

```python
from myapp.models import Lesson, VocabularyWord
print(Lesson.objects.count())
print(VocabularyWord.objects.count())
```

### Возможные ошибки и решения

- `could not translate host name`: проверьте host
- `password authentication failed`: проверьте пароль
- `SSL error`: проверьте `DB_SSLMODE=require`
- `network unreachable`: попробуйте session pooler вместо direct connection
- `duplicate key value`: значит данные уже импортировались ранее; очистите БД или импортируйте в пустую

## 7. Деплой Django на Render

### Что уже подготовлено

- `backend/requirements.txt`
- `backend/Procfile`
- `backend/build.sh`
- `backend/myproject/settings.py`

### Пакеты

В `backend/requirements.txt` уже добавлены:

- `psycopg2-binary`
- `whitenoise`
- `gunicorn`
- `django-cors-headers`
- `djangorestframework`
- `djangorestframework-simplejwt`
- `google-auth`
- `python-dotenv`

### Шаги на Render

1. Зайдите на `https://dashboard.render.com`
2. Нажмите `New +`
3. Выберите `Web Service`
4. Подключите GitHub repo
5. Укажите root directory: `backend`
6. Runtime: `Python 3`
7. Build Command:

```bash
bash build.sh
```

8. Start Command:

```bash
gunicorn myproject.wsgi:application --log-file - --workers 3 --timeout 120
```

### Переменные окружения для Render

Минимальный набор:

```env
DJANGO_SECRET_KEY=your_long_random_secret
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-backend-name.onrender.com
GOOGLE_CLIENT_ID=your_google_client_id
CONTENT_MANAGER_USERNAME=admin
USE_SQLITE=False
DATABASE_URL=postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres
DB_SSLMODE=require
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SECURE_HSTS_SECONDS=31536000
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True
DJANGO_SECURE_HSTS_PRELOAD=True
```

### Почему это важно

- `ALLOWED_HOSTS` нужен, иначе Django вернёт `DisallowedHost`
- `CORS_ALLOWED_ORIGINS` нужен, иначе браузер заблокирует API
- `CSRF_TRUSTED_ORIGINS` нужен для защищённых запросов из браузера
- `DATABASE_URL` или `DB_*` нужны для подключения к Supabase
- `DJANGO_DEBUG=False` выключает лишние утечки информации

## 8. Деплой фронтенда на Vercel

## Важное уточнение

Текущий репозиторий содержит **Vite/React frontend**, а не Next.js app. Поэтому для **этого** репозитория инструкция ниже ориентирована на Vite.

### Шаги для текущего Vite frontend

1. Откройте `https://vercel.com/new`
2. Импортируйте репозиторий
3. Root Directory: `frontend`
4. Framework Preset: `Vite`
5. Build Command:

```bash
npm run build
```

6. Output Directory:

```text
build
```

### Переменные окружения Vercel

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Что уже подготовлено

- `frontend/.env.example`
- `frontend/vercel.json`
- `frontend/src/api/axios.ts`
- `frontend/src/main.tsx`

### Почему это важно

- `VITE_API_BASE_URL` переключает frontend с localhost на Render
- `VITE_GOOGLE_CLIENT_ID` нужен для Google login
- `vercel.json` фиксирует output directory `build`

## 9. Если у вас действительно есть отдельная ветка на Next.js 16

Тогда логика та же, но:

- вместо `VITE_API_BASE_URL` используйте `NEXT_PUBLIC_API_BASE_URL`
- вместо `VITE_GOOGLE_CLIENT_ID` используйте `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `next.config.ts` станет актуальным

### Пример `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
```

## 10. Правильная связка frontend ↔ backend

### Backend

```env
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

### Проверка связи

1. Откройте frontend URL
2. Откройте DevTools → Network
3. Убедитесь, что запросы идут на Render URL
4. Проверьте, что нет ошибки CORS
5. Проверьте, что `/api/test/` отвечает

## 11. Чек-лист готовности к деплою

### Безопасность

- [ ] `DJANGO_DEBUG=False` в production
- [ ] `DJANGO_SECRET_KEY` задан через env
- [ ] `.env` не закоммичен
- [ ] `ALLOWED_HOSTS` заполнен
- [ ] `CORS_ALLOWED_ORIGINS` заполнен только нужными доменами
- [ ] `CSRF_TRUSTED_ORIGINS` заполнен
- [ ] `DJANGO_SESSION_COOKIE_SECURE=True`
- [ ] `DJANGO_CSRF_COOKIE_SECURE=True`
- [ ] `DJANGO_SECURE_SSL_REDIRECT=True`
- [ ] `DJANGO_SECURE_HSTS_SECONDS` задан
- [ ] Google OAuth origin добавлен в Google Cloud Console
- [ ] Google redirect / JS origin совпадают с Vercel доменом
- [ ] Нет hardcoded паролей в коде
- [ ] Нет SQLite в production

### Производительность

- [ ] `CONN_MAX_AGE` включён
- [ ] Есть pagination на list endpoints
- [ ] Есть queryset optimization (`select_related`, `prefetch_related`)
- [ ] Нет тяжёлых запросов без лимитов
- [ ] Картинки грузятся оптимально
- [ ] Build фронтенда проходит без warning-критики
- [ ] Static files собираются через `collectstatic`

### Зависимости

- [ ] `requirements.txt` актуален
- [ ] `package-lock.json` актуален
- [ ] Нет конфликтов версий
- [ ] Python и Node версии зафиксированы
- [ ] `gunicorn` установлен
- [ ] `psycopg2-binary` установлен
- [ ] `whitenoise` установлен
- [ ] `django-cors-headers` установлен

### Конфигурация

- [ ] Render root directory = `backend`
- [ ] Vercel root directory = `frontend`
- [ ] `DATABASE_URL` или `DB_*` корректны
- [ ] `DB_SSLMODE=require` для Supabase
- [ ] `VITE_API_BASE_URL` указывает на production backend
- [ ] `VITE_GOOGLE_CLIENT_ID` задан
- [ ] `build.sh` вызывается при деплое
- [ ] Миграции применяются на деплое

### API и UX

- [ ] `/api/test/` отвечает 200
- [ ] `/api/token/` выдаёт JWT
- [ ] `/api/dashboard/` доступен после логина
- [ ] Сохранение прогресса работает
- [ ] Импортированные уроки читаются из Postgres
- [ ] Ошибки API показываются пользователю понятно
- [ ] Нет бесконечных 401-refresh циклов

### Наблюдаемость

- [ ] Логи Django идут в stdout
- [ ] Ошибки из Render читаются в dashboard
- [ ] Есть внешний uptime check
- [ ] Есть Sentry или аналог
- [ ] Есть план резервного копирования

## 12. Улучшения для production

## A. Автоматизация

### GitHub Actions

Файл уже создан:

- `.github/workflows/deploy.yml`

Что он делает:

1. Проверяет Django
2. Запускает Django tests
3. Собирает frontend
4. Может вызвать deploy hooks Render/Vercel

### Что добавить в GitHub Secrets

- `RENDER_DEPLOY_HOOK_URL`
- `VERCEL_DEPLOY_HOOK_URL`

### Автоматические миграции

Уже заложены в:

- `backend/build.sh`

### Автоматические backup'ы

Рекомендуемая схема:

1. Полагаться на встроенные backups Supabase
2. Дополнительно раз в день делать свой logical dump
3. Складывать backup в GitHub Release assets, S3, Google Drive или другой storage

## B. Безопасность

### Rate limiting

У вас уже есть throttling в Django REST Framework. Это хороший старт.

Что можно усилить:

- снизить `anon` для auth endpoints
- вынести чувствительные endpoints в отдельные throttle scopes

### HTTPS

- Render выдаёт managed TLS
- Vercel выдаёт HTTPS автоматически

### CSRF и XSS

- CSRF уже включён middleware
- добавьте только корректные trusted origins
- не рендерьте небезопасный HTML с фронтенда

### Валидация входных данных

У вас уже есть serializers. Усильте:

- длины полей
- whitelist значений
- санитаризацию rich text, если появится HTML

## C. Производительность

### Кэширование

Стартовый вариант:

- Django database cache

Боевой вариант:

- Redis

Примеры, что кэшировать:

- `/api/lessons/meta/`
- `/api/lessons/`
- `/api/vocabulary/` с публичными фильтрами

### Оптимизация запросов

В проекте уже встречаются `select_related` и `prefetch_related`, это хорошо. Продолжайте это правило для:

- dashboard summary
- analytics endpoints
- audit log

### Пагинация

Обязательно добавьте для:

- `lessons`
- `vocabulary`
- `audit`
- `analytics recent attempts`

### Lazy loading изображений

Для Vite/React:

- добавляйте `loading="lazy"` на `<img>`
- используйте более лёгкие превью

## D. Мониторинг

### Ошибки

Рекомендуемый вариант:

- `sentry-sdk` для Django
- Sentry browser SDK для frontend

### Uptime

Бесплатный вариант:

- UptimeRobot
- Better Stack free monitor

### Производительность

- Web Vitals на Vercel
- basic APM через Sentry Performance или OpenTelemetry позже

## 13. Дополнительные материалы

### Файлы в репозитории

- Backend env example: `backend/.env.example`
- Frontend env example: `frontend/.env.example`
- Backend requirements: `backend/requirements.txt`
- Render Procfile: `backend/Procfile`
- Render build script: `backend/build.sh`
- Vercel config: `frontend/vercel.json`
- GitHub Actions: `.github/workflows/deploy.yml`
- Dockerfile: `backend/Dockerfile`
- Post-deploy checks: `scripts/post-deploy-check.ps1`

## 14. Проверка после деплоя

### Готовый PowerShell-скрипт

```powershell
.\scripts\post-deploy-check.ps1 `
  -FrontendUrl "https://your-frontend.vercel.app" `
  -BackendUrl "https://your-backend.onrender.com" `
  -Username "demo_user" `
  -Password "demo_password" `
  -LessonId 1
```

### Что проверяет скрипт

1. Доступность фронтенда
2. Доступность backend health endpoint
3. CORS preflight
4. JWT login
5. Защищённый endpoint `/api/dashboard/`
6. Сохранение данных в БД через progress endpoint

### Ручные команды для быстрой проверки

```powershell
Invoke-WebRequest https://your-frontend.vercel.app
Invoke-WebRequest https://your-backend.onrender.com/api/test/
```

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri https://your-backend.onrender.com/api/token/ `
  -ContentType "application/json" `
  -Body '{"username":"demo_user","password":"demo_password"}'
```

## 15. Порядок действий без лишней сложности

1. Подготовьте repo и запушьте изменения
2. Создайте Supabase project
3. Перенесите данные из SQLite в Supabase
4. Задеплойте Django в Render
5. Проверьте `/api/test/`
6. Задеплойте frontend в Vercel
7. Вставьте `VITE_API_BASE_URL`
8. Обновите CORS/CSRF origins на backend
9. Проверьте логин и сохранение прогресса
10. Запустите `scripts/post-deploy-check.ps1`

## 16. Источники

Официальные документы, на которые опирается эта инструкция:

- Render free deploy docs: https://render.com/docs/free
- Supabase database connection docs: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase import data docs: https://supabase.com/docs/guides/database/import-data
- Supabase backups docs: https://supabase.com/docs/guides/platform/backups
- Vercel Vite docs: https://vercel.com/docs/frameworks/vite
- Vercel env docs: https://vercel.com/docs/environment-variables
