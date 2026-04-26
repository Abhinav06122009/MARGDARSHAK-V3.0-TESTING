import AdminLayout from '@/components/admin/AdminLayout';
import UserManagementHeader from '@/components/admin/UserManagementHeader';
import UserList from '@/components/admin/UserList';
import { useUserManagement } from '@/hooks/useUserManagement';

/**
 * UserManagement Page (Identity Matrix)
 * 
 * Refactored to follow "Human-Made" principles:
 * - Decoupled logic into useUserManagement hook.
 * - Modularized UI into header and list components.
 * - Clean, readable architecture.
 */
const UserManagement = () => {
  const { 
    query, 
    setQuery, 
    filteredUsers, 
    loading, 
    handleAction 
  } = useUserManagement();

  return (
    <AdminLayout>
      <div className="space-y-10 max-w-[1400px] mx-auto">
        <UserManagementHeader 
          query={query} 
          setQuery={setQuery} 
        />

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-8 shadow-2xl min-h-[600px] transition-all duration-500 hover:border-white/10">
          <UserList 
            loading={loading} 
            users={filteredUsers} 
            onAction={handleAction} 
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;

