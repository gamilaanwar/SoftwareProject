import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          href: user?.role === 'facility_manager' ? '/(tabs)/dashboard' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="worker"
        options={{
          title: "My Tasks",
          href: user?.role === 'worker' ? '/(tabs)/worker' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="work" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "My Issues",
          href: user?.role === 'community_member' ? '/(tabs)' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: "Report Issue",
          href: user?.role === 'community_member' ? '/(tabs)/submit' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="add-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: "Manage",
          href: user?.role === 'facility_manager' ? '/(tabs)/manage' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: user?.role === 'admin' ? '/(tabs)/admin' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="admin-panel-settings" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
