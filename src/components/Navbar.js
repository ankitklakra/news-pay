"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "@/lib/userSlice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          dispatch(setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userData.role
          }));
        }
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    router.push("/login");
    setIsOpen(false);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-card border-b border-border px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="font-bold text-lg text-foreground cursor-pointer" 
          onClick={() => handleNavigation("/")}
        >
          News Pay
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleNavigation("/dashboard")}
            >
              Dashboard
            </Button>
          )}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleNavigation("/login")}
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-4">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/dashboard")}
                  >
                    Dashboard
                  </Button>
                )}
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleNavigation("/login")}
                  >
                    Login
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
} 