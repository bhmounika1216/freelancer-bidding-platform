// Dummy Project model for testing
module.exports = {
  create: async (data) => ({ _id: "mockId123", ...data }),
  find: (query) => ({
    sort: () => [
      { _id: "mockId123", title: "Test Project", userId: query.userId }
    ]
  }),
  findById: async (id) => ({
    _id: id,
    title: "Test Project",
    userId: "user123",
    save: async function () { return this; },
    deleteOne: async function () { return; }
  })
};
