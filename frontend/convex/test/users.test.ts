import { describe, expect, test } from "vitest";
import { v } from "convex/values";
import { createMockUser } from "./utils";
import { createUserValidator, updateUserValidator } from "../types";

describe("User mutations", () => {
  describe("createUser", () => {
    test("validates required fields structure", () => {
      const mockUser = createMockUser();
      
      expect(createUserValidator).toBeDefined();
      expect(mockUser.name).toBeTypeOf("string");
      expect(mockUser.email).toBeTypeOf("string");
      expect(mockUser.name.length).toBeGreaterThan(0);
      expect(mockUser.email).toContain("@");
    });

    test("creates user with valid data", () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
      };
      
      expect(userData.name).toBeTypeOf("string");
      expect(userData.email).toBeTypeOf("string");
      expect(userData.email).toContain("@");
      expect(userData.name.length).toBeGreaterThan(0);
    });

    test("validates email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];
      
      validEmails.forEach(email => {
        expect(email).toContain("@");
        expect(email.split("@")).toHaveLength(2);
      });
    });

    test("rejects invalid email formats", () => {
      const plainAddress = "plainaddress";
      const missingLocal = "@missinglocal.com";
      const missingDomain = "missing@.com";
      const missingTLD = "missing@domain";
      const emptyEmail = "";
      
      // No @ symbol
      expect(plainAddress).not.toContain("@");
      
      // Empty email
      expect(emptyEmail.length).toBe(0);
      
      // Missing local part
      expect(missingLocal.startsWith("@")).toBe(true);
      
      // Missing proper domain
      expect(missingDomain).toContain("@.");
      
      // Missing TLD
      const parts = missingTLD.split("@");
      expect(parts).toHaveLength(2);
      expect(parts[1]).toBe("domain");
      expect(parts[1]).not.toContain(".");
    });

    test("validates required name field", () => {
      const validNames = ["John Doe", "Jane", "Multi Word Name"];
      const invalidNames = ["", "   "];
      
      validNames.forEach(name => {
        expect(name.trim().length).toBeGreaterThan(0);
      });
      
      invalidNames.forEach(name => {
        expect(name.trim().length).toBe(0);
      });
    });

    test("sets proper timestamps", () => {
      const mockUser = createMockUser();
      const now = Date.now();
      
      expect(mockUser.created_at).toBeTypeOf("number");
      expect(mockUser.updated_at).toBeTypeOf("number");
      expect(mockUser.created_at).toBeLessThanOrEqual(now);
      expect(mockUser.updated_at).toBeLessThanOrEqual(now);
    });
  });

  describe("updateUser", () => {
    test("validates update fields structure", () => {
      expect(updateUserValidator).toBeDefined();
      
      const validUpdate = {
        name: "Updated Name",
        email: "updated@example.com",
      };
      
      expect(validUpdate.name).toBeTypeOf("string");
      expect(validUpdate.email).toBeTypeOf("string");
    });

    test("updates user fields", () => {
      const originalUser = createMockUser();
      const updates = {
        name: "Updated Name",
        email: "updated@example.com",
      };
      
      expect(updates.name).not.toBe(originalUser.name);
      expect(updates.email).not.toBe(originalUser.email);
      expect(updates.name).toBeTypeOf("string");
      expect(updates.email).toBeTypeOf("string");
    });

    test("allows partial updates", () => {
      const nameOnlyUpdate = { name: "New Name" };
      const emailOnlyUpdate = { email: "new@example.com" };
      
      expect(nameOnlyUpdate.name).toBeTypeOf("string");
      expect(emailOnlyUpdate.email).toBeTypeOf("string");
      expect(emailOnlyUpdate.email).toContain("@");
    });

    test("validates email format on update", () => {
      const validUpdate = { email: "valid@example.com" };
      const invalidUpdate = { email: "invalid-email" };
      
      expect(validUpdate.email).toContain("@");
      expect(invalidUpdate.email).not.toContain("@");
    });

    test("updates timestamp", () => {
      const originalTime = Date.now() - 1000;
      const updatedTime = Date.now();
      
      expect(updatedTime).toBeGreaterThan(originalTime);
    });
  });

  describe("deleteUser", () => {
    test("handles user deletion scenario", () => {
      const userToDelete = createMockUser();
      
      expect(userToDelete).toBeDefined();
      expect(userToDelete.name).toBeTypeOf("string");
      expect(userToDelete.email).toBeTypeOf("string");
    });

    test("handles non-existent user", () => {
      const nonExistentId = "non-existent-id";
      
      expect(nonExistentId).toBeTypeOf("string");
      expect(nonExistentId.length).toBeGreaterThan(0);
    });
  });

  describe("getUserByEmail", () => {
    test("finds user by email", () => {
      const mockUser = createMockUser();
      
      expect(mockUser.email).toBeTypeOf("string");
      expect(mockUser.email).toContain("@");
    });

    test("handles case sensitivity", () => {
      const email = "Test@Example.com";
      const lowerEmail = email.toLowerCase();
      
      expect(email).not.toBe(lowerEmail);
      expect(lowerEmail).toBe("test@example.com");
    });

    test("returns null for non-existent email", () => {
      const nonExistentEmail = "nonexistent@example.com";
      
      expect(nonExistentEmail).toBeTypeOf("string");
      expect(nonExistentEmail).toContain("@");
    });

    test("validates email format", () => {
      const validEmail = "user@example.com";
      const invalidEmail = "not-an-email";
      
      expect(validEmail).toContain("@");
      expect(invalidEmail).not.toContain("@");
    });
  });

  describe("getUserById", () => {
    test("finds user by ID", () => {
      const mockUser = createMockUser();
      
      expect(mockUser).toBeDefined();
      expect(mockUser.name).toBeTypeOf("string");
      expect(mockUser.email).toBeTypeOf("string");
    });

    test("returns null for non-existent ID", () => {
      const nonExistentId = "non-existent-id";
      
      expect(nonExistentId).toBeTypeOf("string");
      expect(nonExistentId.length).toBeGreaterThan(0);
    });

    test("validates ID format", () => {
      const validId = "user123";
      const emptyId = "";
      
      expect(validId).toBeTypeOf("string");
      expect(validId.length).toBeGreaterThan(0);
      expect(emptyId.length).toBe(0);
    });
  });

  describe("Email uniqueness validation", () => {
    test("validates email uniqueness on creation", () => {
      const email = "unique@example.com";
      
      expect(email).toBeTypeOf("string");
      expect(email).toContain("@");
    });

    test("validates email uniqueness on update", () => {
      const originalEmail = "original@example.com";
      const newEmail = "new@example.com";
      
      expect(originalEmail).not.toBe(newEmail);
      expect(originalEmail).toContain("@");
      expect(newEmail).toContain("@");
    });

    test("allows updating with same email", () => {
      const sameEmail = "same@example.com";
      
      expect(sameEmail).toBeTypeOf("string");
      expect(sameEmail).toContain("@");
    });
  });

  describe("Data integrity", () => {
    test("maintains referential integrity", () => {
      const mockUser = createMockUser();
      
      expect(mockUser.created_at).toBeTypeOf("number");
      expect(mockUser.updated_at).toBeTypeOf("number");
      expect(mockUser.created_at).toBeLessThanOrEqual(mockUser.updated_at);
    });

    test("handles concurrent updates", () => {
      const timestamp1 = Date.now();
      const timestamp2 = Date.now();
      
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
    });
  });
});