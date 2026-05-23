import sqlite3

conn = sqlite3.connect('instance/students.db')
c = conn.cursor()

# Show schema
c.execute("PRAGMA table_info(student)")
print("Schema:", c.fetchall())

# Find Vellore Ashok / Ashok related records
c.execute("SELECT * FROM student WHERE name LIKE '%Ashok%' OR name LIKE '%Vellore%'")
rows = c.fetchall()
print("\nAshok/Vellore rows:", rows)

# Show all columns
c.execute("SELECT * FROM student LIMIT 3")
print("\nSample rows:", c.fetchall())

conn.close()
