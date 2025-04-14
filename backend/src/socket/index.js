module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        // Ngắt kết nối
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
