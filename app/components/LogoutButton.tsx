"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("user");
    router.push("/login");
  }

  return <button onClick={logout}>Logout</button>;
}
