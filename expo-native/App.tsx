import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReceiptsScreen from './src/screens/ReceiptsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { t, getCurrentLocale } from './src/i18n';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'Home': '🏠',
    'Scan': '📷',
    'Receipts': '📋',
    'Settings': '⚙️',
  };
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {icons[label] || '●'}
    </Text>
  );
}

export default function App() {
  const locale = getCurrentLocale();

  const tabLabels = {
    home: locale === 'zh' ? '首页' : 'Home',
    scan: locale === 'zh' ? '扫描' : 'Scan',
    receipts: locale === 'zh' ? '票据' : 'Receipts',
    settings: locale === 'zh' ? '设置' : 'Settings',
  };

  const headerTitles = {
    home: locale === 'zh' ? '支出统计' : 'Dashboard',
    scan: locale === 'zh' ? '票据扫描' : 'Scan Receipt',
    receipts: locale === 'zh' ? '票据列表' : 'All Receipts',
    settings: locale === 'zh' ? '设置' : 'Settings',
  };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          tabBarActiveTintColor: '#4A90D9',
          tabBarInactiveTintColor: '#999',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: '600' },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerTitle: headerTitles.home, tabBarLabel: tabLabels.home }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{ headerTitle: headerTitles.scan, tabBarLabel: tabLabels.scan }}
        />
        <Tab.Screen
          name="Receipts"
          component={ReceiptsScreen}
          options={{ headerTitle: headerTitles.receipts, tabBarLabel: tabLabels.receipts }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerTitle: headerTitles.settings, tabBarLabel: tabLabels.settings }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
