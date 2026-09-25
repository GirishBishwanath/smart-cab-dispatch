import RideRequest from "../models/RideRequest.js";

const ensureDatabaseIndexes = async () => {
    const indexes = await RideRequest.collection.indexes();

    const legacyActiveGuestIndex = indexes.find(
        (index) =>
            index.unique === true &&
            index.key?.guest === 1 &&
            index.partialFilterExpression?.status?.$in
    );

    if (legacyActiveGuestIndex) {
        await RideRequest.collection.dropIndex(legacyActiveGuestIndex.name);
    }

    await RideRequest.createIndexes();
};

export default ensureDatabaseIndexes;
