export const auth = {
  currentUser: { email: "test@example.com", uid: "123" },
};

export const onAuthStateChanged = jest.fn((auth, callback) => {
  callback(auth.currentUser);
  return jest.fn(); // mock unsubscribe
});
