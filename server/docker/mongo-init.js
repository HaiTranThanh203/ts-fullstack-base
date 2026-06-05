db = db.getSiblingDB('myapp');

db.createUser({
  user: 'myapp_user',
  pwd: 'myapp_password',
  roles: [
    {
      role: 'readWrite',
      db: 'myapp',
    },
  ],
});

db.createCollection('users');