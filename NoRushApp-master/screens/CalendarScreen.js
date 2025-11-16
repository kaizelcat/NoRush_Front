import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = 'CALENDAR_MEMOS_V1';

// 오늘 날짜
const getToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [memos, setMemos] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [memoInput, setMemoInput] = useState('');

    useEffect(() => { loadMemos(); }, []);

    const loadMemos = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) setMemos(JSON.parse(data));
        } catch (e) { console.log(e); }
    };

    const saveMemos = async (next) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) { console.log(e); }
    };

    const openModalForDate = (dateStr) => {
        setSelectedDate(dateStr);
        setModalDate(dateStr);
        setMemoInput('');
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setModalDate(null);
        setMemoInput('');
    };

    const handleAddMemo = () => {
        const text = memoInput.trim();
        if (!text) {
            Alert.alert("알림", "메모를 입력하세요!");
            return;
        }

        const dateKey = modalDate;
        const newMemo = {
            id: Date.now().toString(),
            text,
            createdAt: new Date().toISOString(),
        };

        const next = {
            ...memos,
            [dateKey]: [...(memos[dateKey] || []), newMemo],
        };

        setMemos(next);
        saveMemos(next);
        closeModal();
    };

    const handleDeleteMemo = (dateKey, id) => {
        Alert.alert("삭제", "정말 삭제할까요?", [
            { text: "취소", style: "cancel" },
            {
                text: "삭제",
                style: "destructive",
                onPress: () => {
                    const remain = memos[dateKey].filter((m) => m.id !== id);
                    const next = { ...memos };
                    if (remain.length === 0) delete next[dateKey];
                    else next[dateKey] = remain;

                    setMemos(next);
                    saveMemos(next);
                }
            }
        ]);
    };

    const today = getToday();
    const memosForModal = modalDate ? memos[modalDate] || [] : [];

    return (
        <View style={styles.container}>

            {/* 달력 */}
            <View style={styles.calendarWrapper}>
                <Calendar
                    style={styles.calendar}
                    initialDate={selectedDate}
                    monthFormat={'yyyy년 MM월'}
                    onDayPress={(day) => openModalForDate(day.dateString)}
                    dayComponent={({ date, state }) => {
                        const dateStr = date.dateString;
                        const isSelected = selectedDate === dateStr;
                        const isToday = today === dateStr;

                        const hasMemo = memos[dateStr]?.length > 0;
                        const firstMemo = hasMemo ? memos[dateStr][0].text : '';

                        return (
                            <TouchableOpacity onPress={() => openModalForDate(dateStr)}>
                                <View
                                    style={[
                                        styles.dayContainer,
                                        isSelected && styles.daySelected,
                                        state === 'disabled' && styles.dayDisabled,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isToday && isSelected && styles.dayTodaySelectedText,
                                            isToday && !isSelected && styles.dayTodayText,
                                            !isToday && isSelected && styles.dayTextSelected,
                                            state === 'disabled' && styles.dayTextDisabled,

                                        ]}
                                    >
                                        {date.day}
                                    </Text>

                                    {hasMemo && (
                                        <Text
                                            style={[
                                                styles.dayMemoText,
                                                isSelected && styles.dayMemoTextSelected,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {firstMemo}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}

                />
            </View>

            {/* 모달 */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                >
                    <View style={styles.modalContainer}>
                        {/* 상단 */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalDate}</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={24} />
                            </TouchableOpacity>
                        </View>

                        {/* 메모 리스트 */}
                        {memosForModal.length === 0 ? (
                            <Text style={styles.emptyText}>메모가 없습니다.</Text>
                        ) : (
                            <FlatList
                                data={memosForModal}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <View style={styles.memoItem}>
                                        <Text style={styles.memoText}>{item.text}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteMemo(modalDate, item.id)}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#ff4d4f" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}

                        {/* 입력 */}
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="메모를 입력하세요"
                                value={memoInput}
                                onChangeText={setMemoInput}
                                onSubmitEditing={handleAddMemo}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={handleAddMemo}>
                                <Ionicons name="add" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    );
}




// ------------------------------------
// 스타일
// ------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    calendarWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    calendar: {
        alignSelf: 'stretch',
    },

    dayContainer: {
        height: 60,
        paddingHorizontal: 4,
        paddingTop: 4,
        borderRadius: 12,
    },

    dayTodayText: {
        color: '#1a56db',
        fontWeight: '700',
    },

    dayTodaySelectedText: {
        color: '#7aa7ff',  
        fontWeight: '700',
    },

    daySelected: {
        backgroundColor: '#111',
    },

    dayDisabled: { opacity: 0.35 },

    dayText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dayTextSelected: {
        color: '#fff',
    },
    dayTextDisabled: {
        color: '#bbb',
    },

    dayMemoText: {
        fontSize: 10,
        marginTop: 2,
        color: '#444',
    },
    dayMemoTextSelected: {
        color: '#eee',
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    modalContainer: {
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 18,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },

    emptyText: {
        color: '#999',
        marginTop: 10,
    },

    memoItem: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f7f7f7',
        marginBottom: 6,
        justifyContent: 'space-between',
    },
    memoText: {
        fontSize: 14,
        flex: 1,
    },

    inputRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addButton: {
        backgroundColor: '#416cec',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
