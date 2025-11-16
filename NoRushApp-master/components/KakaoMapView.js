// KakaoMapView.js

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_JAVASCRIPT_KEY } from '../setting.js';

// WebView에 로드될 HTML 콘텐츠 (카카오맵 로드)
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    
    <script>
        // React Native로 메시지를 전달하는 함수
        function logToReactNative(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(message);
            }
        }
    </script>

    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}"></script>
    
    <script>
        // SDK 로드 완료 후 지도를 생성.
        // kakao.maps.load()는 SDK 로드 완료.
        kakao.maps.load(function() {
            try {
                var mapContainer = document.getElementById('map'), // 지도를 표시할 div
                    mapOption = { 
                        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청을 기본 중심으로 설정
                        level: 3 // 지도의 확대 레벨
                    };  

                // 지도를 생성합니다
                var map = new kakao.maps.Map(mapContainer, mapOption);
                // 교통정보 표시 
                map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);

                logToReactNative('Kakao Map initialized successfully!');
            } catch (e) {
                // 지도 생성 중 오류 발생 시
                logToReactNative('Map Initialization Failed: ' + e.message);
            }
        });

        // SDK 로드 자체가 실패
        setTimeout(() => {
            if (typeof kakao === 'undefined' || !document.getElementById('map').children.length) {
                 logToReactNative('Kakao SDK failed to load or map is empty. Check App Key & Domain Registration!');
            }
        }, 3000); // 3초 후 지도 로드 여부 확인
    </script>
</body>
</html>
`;


const KakaoMapView = ({ style }) => {
    // LOG 출력부분
    const onMessage = (event) => {
        console.log('[Kakao WebView LOG]:', event.nativeEvent.data);
    };

    return (
        <View style={[styles.container, style]}>
            <WebView
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={styles.webView}
                androidLayerType={Platform.OS === 'android' ? 'software' : 'none'} 
                
                // 디버깅을 위한 이벤트 핸들러
                onMessage={onMessage} 
                onError={(e) => console.warn('WebView Error (RN Side):', e.nativeEvent)}
                onHttpError={(e) => console.warn('HTTP Error (RN Side):', e.nativeEvent)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default KakaoMapView;