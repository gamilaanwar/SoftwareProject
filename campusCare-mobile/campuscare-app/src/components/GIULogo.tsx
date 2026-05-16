import React from 'react';
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';

interface GIULogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export const GIULogo: React.FC<GIULogoProps> = ({ size = 'small', style, imageStyle }) => {
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 30 };
      case 'medium':
        return { width: 100, height: 50 };
      case 'large':
        return { width: 150, height: 75 };
      default:
        return { width: 60, height: 30 };
    }
  };

  const dimensions = getDimensions();

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/images/giu-logo.jpg')}
        style={[dimensions, styles.logo, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    borderRadius: 4,
  },
});
