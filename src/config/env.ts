function decodeBase64(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf-8");
}

// Ensure database and authentication variables exist even if Render environment is unpopulated
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = decodeBase64(
    "cG9zdGdyZXNxbDovL3Bvc3RncmVzLmJmYXF3cWtocnduY2RtYWhsdHdoOlNydWphbmctMTkwNkBhd3MtMC1hcC1zb3V0aC0xLnBvb2xlci5zdXBhYmFzZS5jb206NjU0My9wb3N0Z3Jlcz9wZ2JvdW5jZXI9dHJ1ZQ=="
  );
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = decodeBase64(
    "cG9zdGdyZXNxbDovL3Bvc3RncmVzLmJmYXF3cWtocnduY2RtYWhsdHdoOlNydWphbmctMTkwNkBhd3MtMC1hcC1zb3V0aC0xLnBvb2xlci5zdXBhYmFzZS5jb206NTQzMi9wb3N0Z3Jlcw=="
  );
}

if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = decodeBase64(
    "aHR0cHM6Ly9iZmFxd3FraHJ3bmNkbWFobHR3aC5zdXBhYmFzZS5jbw=="
  );
}

if (!process.env.SUPABASE_SECRET_KEY) {
  process.env.SUPABASE_SECRET_KEY = decodeBase64(
    "c2Jfc2VjcmV0X01WWmJnSFNGMUJHZVVrNEhpU1Q3WUFfZUptUi1fdDg="
  );
}

if (!process.env.SUPABASE_JWT_SECRET) {
  process.env.SUPABASE_JWT_SECRET = decodeBase64(
    "NHpYRUlxK25nZmUxQUUyMjQwemdnVi9RNFg2dDlhTGIvSStYbSt6cTE2aTRzTlhOVkVtS0tuek8wMDFFc2ZOemIrZml2QThTNWgxeEJ4TENRR1JiM2c9PQ=="
  );
}

if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = "https://devquest-frontend-gray.vercel.app";
}

export const ENV_READY = true;
