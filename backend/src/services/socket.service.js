import {
    emitToUser,
} from "../sockets/socket.js";


const emitRideAssigned = (
    userId,
    ride
) => {
    emitToUser(
        userId,
        "ride:assigned",
        {
            ride,
        }
    );
};


const emitRideAccepted = (
    userId,
    ride
) => {
    emitToUser(
        userId,
        "ride:accepted",
        {
            ride,
        }
    );
};


const emitRideStatus = (
    userId,
    ride
) => {
    emitToUser(
        userId,
        "ride:status",
        {
            ride,
        }
    );
};


const emitRideCompleted = (
    userId,
    ride
) => {
    emitToUser(
        userId,
        "ride:completed",
        {
            ride,
        }
    );
};


const emitDriverStatus = (
    userId,
    driver
) => {
    emitToUser(
        userId,
        "driver:status",
        {
            driver,
        }
    );
};


export default {
    emitRideAssigned,
    emitRideAccepted,
    emitRideStatus,
    emitRideCompleted,
    emitDriverStatus,
};