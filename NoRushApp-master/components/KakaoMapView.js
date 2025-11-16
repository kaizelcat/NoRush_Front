// KakaoMapView.js

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
// 경고: '../setting.js' 파일에 KAKAO_JAVASCRIPT_KEY가 실제로 존재하는지 확인하세요.
import { KAKAO_JAVASCRIPT_KEY } from '../setting.js'; 

// WebView에 로드될 HTML 콘텐츠 (기존 코드 그대로 유지)
const htmlContent = (key) => `
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
        function logToReactNative(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(message);
            }
        }
    </script>

    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}"></script>
    
    <script>
        // 지도, 마커, 순서 처리 플래그 전역 변수
        var map;
        var userMarker = null;
        var isMapReady = false; // 지도가 초기화되었는지 여부
        var pendingLocation = null; // 지도가 준비되기 전에 받은 위치 정보

        // React Native로부터 위치를 받아 지도 중앙을 이동하고 마커를 표시하는 함수
        function moveMapCenterAndAddMarker(lat, lng) {
            
            if (!isMapReady) {
                // 지도가 아직 준비되지 않았다면, 위치를 저장하고 대기
                pendingLocation = { lat: lat, lng: lng };
                logToReactNative('JS: Map not ready, location saved for later.');
                return;
            }

            logToReactNative('JS: Moving map to: ' + lat + ', ' + lng);
            
            var moveLatLon = new kakao.maps.LatLng(lat, lng);
            
            // 지도 중심을 이동
            map.setCenter(moveLatLon);
            map.setLevel(3); // 레벨을 다시 설정하여 확실하게 확대

            // 기존 마커가 있다면 제거
            if (userMarker) {
                userMarker.setMap(null);
            }

            // 새로운 마커 생성 및 표시
            userMarker = new kakao.maps.Marker({
                map: map,
                position: moveLatLon,
                title: '현재 나의 위치', 
            });

            userMarker.setMap(map);
            logToReactNative('JS: User Marker added successfully.');
        }

        // SDK 로드 완료 후 지도를 생성.
        kakao.maps.load(function() {
            try {
                var mapContainer = document.getElementById('map'),
                    mapOption = { 
                        center: new kakao.maps.LatLng(37.566826, 126.9786567), 
                        level: 3 
                    };  

                // 지도를 생성 (전역 map 변수에 할당)
                map = new kakao.maps.Map(mapContainer, mapOption);
                map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);
                
                // 지도가 준비됨을 알림
                isMapReady = true; 
                logToReactNative('Kakao Map initialized successfully!');

                // 지도가 준비되는 동안 받은 위치 정보가 있다면 즉시 적용
                if (pendingLocation) {
                    moveMapCenterAndAddMarker(pendingLocation.lat, pendingLocation.lng);
                    pendingLocation = null;
                }

            } catch (e) {
                logToReactNative('Map Initialization Failed: ' + e.message);
            }
        });
    </script>
</body>
</html>
`;


const KakaoMapView = ({ style, initialLocation }) => { 
    const webviewRef = useRef(null); 

    useEffect(() => {
        if (initialLocation) {
            // 500ms 지연 추가: WebView 로드 완료를 기다립니다.
            const timeout = setTimeout(() => {
                if (webviewRef.current) {
                    const { latitude, longitude } = initialLocation;
                    // moveMapCenterAndAddMarker 함수를 호출하는 JS 코드 주입
                    const script = `
                        if (typeof moveMapCenterAndAddMarker === 'function') {
                            moveMapCenterAndAddMarker(${latitude}, ${longitude});
                        }
                        true;
                    `;
                    webviewRef.current.injectJavaScript(script);
                }
            }, 500); // 500ms 지연

            // 컴포넌트 정리 시 타이머를 해제합니다.
            return () => clearTimeout(timeout);
        }
    }, [initialLocation]);

    const onMessage = (event) => {
        // 디버깅 로그 활성화: WebView 내부에서 전달된 메시지를 확인합니다.
        console.log('[Kakao WebView LOG]:', event.nativeEvent.data);
    };

    return (
        <View style={[styles.container, style]}>
            <WebView
                ref={webviewRef} 
                originWhitelist={['*']}
                source={{ html: htmlContent(KAKAO_JAVASCRIPT_KEY) }} 
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={styles.webView}
                androidLayerType={Platform.OS === 'android' ? 'software' : 'none'} 
                onMessage={onMessage} // onMessage 핸들러 연결
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