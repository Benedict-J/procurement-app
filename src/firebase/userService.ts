import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fetchAllUsers = async (userProfile: any) => {
    if (!userProfile) return;

    // Fetch registered users
    const registeredUsersSnapshot = await getDocs(collection(db, 'registeredUsers'));

    const registeredUsersData = registeredUsersSnapshot.docs
        .map(doc => ({
            ...doc.data(),
            id: doc.id,
            source: 'registeredUsers',
        }))
        .filter(user => user.id !== userProfile.userId);

    // Fetch pre-registered users
    const preRegisteredUsersSnapshot = await getDocs(collection(db, 'preRegisteredUsers'));
    const preRegisteredUsersData = preRegisteredUsersSnapshot.docs
        .map(doc => ({
            ...doc.data(),
            id: doc.id,
            nik: doc.id,
            source: 'preRegisteredUsers',
        }))
        .filter(user => user.nik !== userProfile?.nik);

    // Combine both lists
    return [...registeredUsersData, ...preRegisteredUsersData];
};