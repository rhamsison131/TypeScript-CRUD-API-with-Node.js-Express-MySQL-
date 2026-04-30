import { User } from './user.model';

export const getAll = async () => {
  return await User.findAll({ attributes: { exclude: ['password'] } });
};

export const getById = async (id: number) => {
  return await User.findByPk(id, { attributes: { exclude: ['password'] } });
};

export const create = async (params: any) => {
  // Hash password before creating the user
  // Example: params.password = await hashPassword(params.password);
  await User.create(params);
};

export const update = async (id: number, params: any) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.update(params);
};

export const deleteUser = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.destroy();
};

// Export all functions as a group
export const userController = {
  getAll,
  getById,
  create,
  update,
  deleteUser
};