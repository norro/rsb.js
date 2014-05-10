console.log("RSB.js")

var net = require('net');
var ProtoBuf = require("protobufjs");

// RSB protocol
var rsbprotopath = "/home/norro/local/prefix/0.11/share/rsbprotocol0.11/";

try {
    var notificationbuilder = ProtoBuf.loadProtoFile({ root: rsbprotopath, file: "rsb/protocol/Notification.proto" });
} catch (e) {
    console.log("Error when creating protobuf builder: " + e);
}

var socket = net.connect({port: 55555, host: 'localhost'},  function() { 
    var established = false;

    // Connection Successful
    console.log('Socket connected...');

    // Data Received from Server
    socket.on('data', function(d) {
        var received = new Date().getTime() * 1000;
    
        if (established == false) {
            // establish initial connection
            if (d.length == 4 && d[0] == 0) { // rsb m_zero
                console.log("Received rsb m_zero message...");
                console.log('** Connection to RSB server established **\n');
                established = true;
            } else {
                ecit
            }
        } else {
            console.log('__________________________________________________');

            var buffer = new Buffer(d.length - 4);
            for(var i=0; i<d.length - 4; i++) {
                buffer[i] = d[i+4];
            }
            
            try {
                var Notification = notificationbuilder.build("rsb.protocol.Notification");
            } catch (e) {
                console.log("Error when building protobuf: " + e);
            }

            try {
                var notification = Notification.decode(buffer);
                
                // Method
                var method = notification.method.toUTF8();
                if (method === "") {
                    method = "N/A";
                }
                
                // Origin
                var origin = notification.event_id.sender_id.toHex();
                
                // Timestamps
                var delivered = new Date().getTime() * 1000;
                var created = notification.meta_data.create_time;
                var send = notification.meta_data.send_time;
                
                console.log('Event');
                console.log("  Scope\t\t\t: " + notification.scope.toUTF8());
                console.log("  Id\t\t\t: ");
                console.log("  Sequence-Number\t: " + notification.event_id.sequence_number);
                console.log("  Origin\t\t: " + origin);
                console.log("  Method\t\t: " + method);

                console.log('Timestamps');
                console.log("  Create\t: "  + new Date(created / 1000).toISOString());
                console.log("  Send\t\t: "  + new Date(send / 1000).toISOString());
                console.log("  Receive\t: " + new Date(received / 1000).toISOString());
                console.log("  Deliver\t: " + new Date(delivered / 1000).toISOString());

                console.log('Meta-Data');
                console.log("  Payload-Size\t: ");
                console.log("  Wire-Schema\t: " + notification.wire_schema.toUTF8());

                console.log("Payload (" + notification.wire_schema.toUTF8() + ")");
                if (notification.wire_schema.toUTF8() === "utf-8-string") {
                    console.log("  \"" + notification.data.toUTF8() + "\"");
                } else {
                }
            } catch (e) {
                if (e.decoded) { // Truncated
                    console.log("Decoded message with missing required fields");
                    notification = e.decoded; // Decoded message with missing required fields
                } else { // General error
                    console.log("General error: " + e);
                }
            }
        }
    });

    socket.on('end', function() {
        console.log('Received "end".');
    });

    socket.on('error', function(e) {             
        console.log('Error: ' + e);
    });
});

