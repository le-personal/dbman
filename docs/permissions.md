# Permissions

The permissions each user can have are the following:

1. View
2. Edit
3. Import
4. Remove

Additionally, there's an "Admin" role, which means that some operations can only be performed by users who are Admins.

## Operations users can perform:
### View
A user with this permission can:

1. View the database information
2. Lock the database if the database is not locked
3. View users in the database
4. View the users with permissions to access the database
5. Download, view, create and remove a backup

### Edit
Users with this permission can edit the database information and create and remove database users but not the permissions.

### Import
Users with this permission can import a SQL file into a database. It does not allow them to create new databases.

### Remove (Depreciated)
Users with this permission can remove or delete a database.

### Admins
The administrators are the only ones allowed to:

1. Create a database
2. Remove a database
3. Unlock a database
4. Manage permissions