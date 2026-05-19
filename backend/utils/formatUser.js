function formatUser(user) {
  if (!user) return null;

  const doc = user.toObject ? user.toObject() : user;

  return {
    id: doc._id?.toString() || doc.id,
    name: doc.name || '',
    email: doc.email || '',
    phone: doc.phone || '',
    avatar: doc.avatar || '',
    profilePicture: doc.avatar || '',
    authProvider: doc.authProvider || 'local',
    googleId: doc.googleId || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

module.exports = { formatUser };
