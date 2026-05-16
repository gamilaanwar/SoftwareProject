import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { Colors } from "../../src/constants/Colors";
import { Platform } from "react-native";
import { GIULogo } from "../../src/components/GIULogo";

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.secondary,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: Platform.OS === 'ios' ? 0 : 4,
      },
      tabBarStyle: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.accent,
        height: Platform.OS === 'ios' ? 88 : 65,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      tabBarHideOnKeyboard: true,
      headerStyle: {
        backgroundColor: Colors.primary,
        height: Platform.OS === 'ios' ? 100 : 80,
      },
      headerTintColor: Colors.white,
      headerTitleStyle: {
        fontWeight: '800',
        fontSize: 18,
      },
      headerTitleAlign: 'center',
      headerRight: () => <GIULogo style={{ marginRight: 15 }} />,
    }}>
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
          title: "Tasks",
          href: user?.role === 'worker' ? '/(tabs)/worker' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="assignment" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Issues",
          href: user?.role === 'community_member' ? '/(tabs)' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="format-list-bulleted" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: "Report",
          href: user?.role === 'community_member' ? '/(tabs)/submit' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="add-circle-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: "Staff",
          href: user?.role === 'facility_manager' ? '/(tabs)/manage' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="people-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: user?.role === 'admin' ? '/(tabs)/admin' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="security" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <MaterialIcons name="person-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
