// Test utility for creating mock invitation data

export interface MockInvitation {
  token: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  learner: {
    name: string;
    bio?: string;
  };
  invitingMentor: {
    name?: string;
    email?: string;
  };
  expiresAt: number;
}

export const createMockInvitation = (overrides: Partial<MockInvitation> = {}): MockInvitation => {
  return {
    token: 'test-token-123',
    email: 'test@example.com',
    status: 'pending',
    learner: {
      name: 'Test Learner',
      bio: 'A test learner for invitation testing',
    },
    invitingMentor: {
      name: 'Test Mentor',
      email: 'mentor@test.com',
    },
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    ...overrides,
  };
};

export const createExpiredInvitation = (): MockInvitation => {
  return createMockInvitation({
    token: 'expired-token-123',
    status: 'expired',
    expiresAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  });
};

export const createAcceptedInvitation = (): MockInvitation => {
  return createMockInvitation({
    token: 'accepted-token-123',
    status: 'accepted',
  });
};