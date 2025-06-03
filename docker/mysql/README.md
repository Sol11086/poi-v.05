# MySQL Docker Setup for POI Project

This directory contains the Docker configuration for running MySQL database for the POI project.

## Directory Structure

```
docker/mysql/
├── init/
│   ├── 01-init.sql    # Database schema initialization
│   └── 02-seed.sql    # Initial data seeding
└── README.md          # This file
```

## Quick Start

1. Start the database:
```bash
docker-compose up -d
```

2. Stop the database:
```bash
docker-compose down
```

3. View logs:
```bash
docker-compose logs -f mysql
```

## Database Connection Details

- Host: localhost
- Port: 3306
- Database: db_poi_v1
- Username: root
- Password: 12345

## Connection String

```
mysql://root:12345@localhost:3306/db_poi_v1
```

## Useful Commands

1. Connect to MySQL container:
```bash
docker exec -it poi_mysql mysql -uroot -p12345
```

2. Backup database:
```bash
docker exec poi_mysql mysqldump -uroot -p12345 db_poi_v1 > backup.sql
```

3. Restore database:
```bash
docker exec -i poi_mysql mysql -uroot -p12345 db_poi_v1 < backup.sql
```

## Notes

- The database data is persisted in a Docker volume named `poi_mysql_data`
- Initialization scripts in the `init` directory are executed in alphabetical order
- The database is configured to use the native password authentication plugin
- The container will automatically restart if it crashes or if the system reboots 