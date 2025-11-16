import { BASE_URL } from '../setting';

const SERVER_HOST = `http://${BASE_URL}:8080`;

// 📌 사용자 인증에 필요한 액세스 토큰은 실제 앱에서는 AsyncStorage 등에 저장된 것을 불러와야 합니다.
// 📌 여기서는 임시 값으로 대체합니다. 실제 로직에서는 반드시 토큰을 불러오세요.
const getAccessToken = () => {
    // 실제로는 AsyncStorage 등에서 토큰을 비동기로 불러와야 합니다.
    console.warn("⚠️ [알림] getAccessToken 함수를 실제 토큰 로직으로 교체해야 합니다.");
    return "YOUR_AUTH_ACCESS_TOKEN"; // 임시 토큰
};


// 캘린더 조회
export const fetchCalendarData = async () => {
    const token = getAccessToken();
    const url = `${SERVER_HOST}/api/calendar`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // 토큰 전송
            },
        });

        if (!response.ok) {
            throw new Error(`캘린더 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ 캘린더 데이터 조회 성공:", data);
        return data;
    } catch (error) {
        console.error("❌ 캘린더 조회 중 오류 발생:", error);
        throw error; // 에러를 호출한 곳으로 다시 던져 UI에서 처리하도록 함
    }
};

// 메모 추가
/**
 * @param {object} memoData - { title: string, content: string, date: string } 등 백엔드 모델에 맞는 데이터
 */
export const createMemo = async (memoData) => {
    const token = getAccessToken();
    const url = `${SERVER_HOST}/api/memos`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(memoData),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`메모 추가 실패: ${response.status} - ${errorBody.msg || '서버 오류'}`);
        }

        const data = await response.json();
        console.log("✅ 메모 추가 성공:", data);
        return data; // 새로 생성된 메모의 정보 (ID 포함)
    } catch (error) {
        console.error("❌ 메모 추가 중 오류 발생:", error);
        throw error;
    }
};


// 메모 수정 
/**
 * @param {string} memoId - 수정할 메모의 ID
 * @param {object} updatedData - { title?: string, content?: string } 등 수정할 내용
 */
export const updateMemo = async (memoId, updatedData) => {
    const token = getAccessToken();
    const url = `${SERVER_HOST}/api/memos/${memoId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`메모 수정 실패: ${response.status} - ${errorBody.msg || '서버 오류'}`);
        }

        const data = await response.json();
        console.log(`✅ 메모 (ID: ${memoId}) 수정 성공:`, data);
        return data; // 수정된 메모 정보
    } catch (error) {
        console.error(`❌ 메모 (ID: ${memoId}) 수정 중 오류 발생:`, error);
        throw error;
    }
};

// 메모 삭제
/**
 * @param {string} memoId - 삭제할 메모의 ID
 */
export const deleteMemo = async (memoId) => {
    const token = getAccessToken();
    const url = `${SERVER_HOST}/api/memos/${memoId}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 204 || response.ok) { // 204 No Content 또는 200 OK 처리
            console.log(`✅ 메모 (ID: ${memoId}) 삭제 성공`);
            return { success: true };
        } else {
            const errorBody = await response.json();
            throw new Error(`메모 삭제 실패: ${response.status} - ${errorBody.msg || '서버 오류'}`);
        }
    } catch (error) {
        console.error(`❌ 메모 (ID: ${memoId}) 삭제 중 오류 발생:`, error);
        throw error;
    }
};