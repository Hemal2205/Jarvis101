import sqlite3
conn = sqlite3.connect("C:/Users/hemal/Desktop/JARVIS/jar/Jarvis101/backend/jarvis.db")
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(c.fetchall())
conn.close()