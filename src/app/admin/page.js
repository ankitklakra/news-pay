"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkAdminStatus, setAdminStatus } from "@/lib/admin";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const isAdmin = await checkAdminStatus(currentUser.uid);
      if (!isAdmin) {
        router.push("/");
        return;
      }

      fetchUsers();
    };

    checkAccess();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = await getDocs(collection(db, "users"));
      const usersData = await Promise.all(
        usersCollection.docs.map(async (doc) => {
          const adminStatus = await checkAdminStatus(doc.id);
          return {
            id: doc.id,
            ...doc.data(),
            isAdmin: adminStatus,
          };
        })
      );
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await setAdminStatus(userId, !currentStatus);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error toggling admin status:", error);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.isAdmin ? "Admin" : "User"}
                  </p>
                </div>
                <Button
                  variant={user.isAdmin ? "destructive" : "default"}
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                >
                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 