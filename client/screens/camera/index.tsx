import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { createFormDataFile } from '@/utils';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function CameraScreen() {
  const router = useSafeRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  if (!permission) {
    return (
      <Screen>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.permissionContainer}>
          <FontAwesome6 name="camera" size={48} color="#B2BEC3" />
          <Text style={styles.permissionText}>需要相机权限才能拍照搜题</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>授权相机</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage}>
            <FontAwesome6 name="images" size={20} color="#6C63FF" />
            <Text style={styles.galleryBtnText}>从相册选择</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setCapturedImage(uri);
      await handleSearch(uri);
    }
  }

  async function handleTakePicture() {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        await handleSearch(photo.uri);
      }
    } catch (error) {
      console.error('Take picture error:', error);
    }
  }

  async function handleSearch(imageUri: string) {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      const file = await createFormDataFile(imageUri, 'search_photo.jpg', 'image/jpeg');
      formData.append('file', file as any);

      /**
       * 服务端文件：server/src/routes/search.ts
       * 接口：POST /api/v1/search/photo
       * Body: FormData with file (image/jpeg)
       */
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search/photo`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      
      if (json.code === 0 && json.data.questions.length > 0) {
        // Pass the question IDs to the search result page
        const questionIds = json.data.questions.map((q: any) => q.id).join(',');
        router.replace('/search-result', { questionIds, imageUri });
      } else {
        alert('未找到相关题目，请尝试拍摄更清晰的图片');
        setCapturedImage(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('搜索失败，请稍后重试');
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSwitchCamera() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  if (capturedImage && isProcessing) {
    return (
      <Screen>
        <View style={styles.processingContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.processingText}>正在识别题目...</Text>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome6 name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>拍照搜题</Text>
          <TouchableOpacity onPress={handleSwitchCamera} style={styles.switchBtn}>
            <FontAwesome6 name="rotate" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Camera Preview */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            {/* Guide overlay */}
            <View style={styles.guideOverlay}>
              <View style={styles.guideFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <Text style={styles.guideText}>将题目放入框内，保持清晰</Text>
            </View>
          </CameraView>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.galleryControl} onPress={handlePickImage}>
            <FontAwesome6 name="images" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePicture}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          
          <View style={styles.placeholderControl} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0F0F3',
  },
  permissionText: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 24,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  permissionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  galleryBtnText: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  switchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  guideOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#6C63FF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  guideText: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  galleryControl: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF',
  },
  placeholderControl: {
    width: 50,
    height: 50,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  processingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});
