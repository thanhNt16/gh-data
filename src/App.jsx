import React, { useEffect, useState } from "react";

const BitqueryWebSocketComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const token = "ory_dummy"; // Replace with your actual token
  const bitqueryUrl = `wss://streaming.bitquery.io/graphql?token=${token}`;

  useEffect(() => {
    const bitqueryConnection = new WebSocket(bitqueryUrl, ["graphql-ws"]);

    bitqueryConnection.onopen = () => {
      console.log("Connected to Bitquery.");
      setIsConnected(true);

      // Send initialization message (connection_init)
      const initMessage = JSON.stringify({ type: "connection_init" });
      bitqueryConnection.send(initMessage);
    };

    bitqueryConnection.onmessage = (event) => {
      const response = JSON.parse(event.data);

      // Handle connection acknowledgment (connection_ack)
      if (response.type === "connection_ack") {
        console.log("Connection acknowledged by server.");

        // Send subscription message after receiving connection_ack
        const subscriptionMessage = JSON.stringify({
          type: "start",
          id: "1",
          payload: {
            query: `
              subscription MyQuery {
                EVM(network: eth) {
                  DEXTrades {
                    Block {
                      Time
                    }
                    Transaction {
                      Hash
                    }
                    Trade {
                      Buy {
                        Buyer
                        AmountInUSD
                        Amount
                        Seller
                        PriceInUSD
                        Price
                        Currency {
                          Name
                          Symbol
                          SmartContract
                        }
                      }
                      Dex {
                        SmartContract
                        ProtocolName
                        ProtocolVersion
                      }
                      Sell {
                        Buyer
                        AmountInUSD
                        Amount
                        Seller
                        PriceInUSD
                        Price
                        Currency {
                          Name
                          Symbol
                          SmartContract
                        }
                      }
                    }
                  }
                }
              }
            `,
          },
        });

        bitqueryConnection.send(subscriptionMessage);
        console.log("Subscription message sent.");

        // Stop subscription after 10 seconds
        // setTimeout(() => {
        //   const stopMessage = JSON.stringify({ type: "stop", id: "1" });
        //   bitqueryConnection.send(stopMessage);
        //   console.log("Stop message sent after 10 seconds.");

        //   // Close WebSocket connection after 1 second
        //   setTimeout(() => {
        //     console.log("Closing WebSocket connection.");
        //     bitqueryConnection.close();
        //   }, 1000);
        // }, 10000);
      }

      // Handle received data
      if (response.type === "data") {
        console.log("Received data from Bitquery: ", response.payload.data);
        setData(response.payload.data); // Update state with received data
      }

      // Handle keep-alive messages (ka)
      if (response.type === "ka") {
        console.log("Keep-alive message received.");
      }

      // Handle errors
      if (response.type === "error") {
        console.error("Error message received:", response.payload.errors);
        setError(response.payload.errors); // Update state with errors
      }
    };

    bitqueryConnection.onclose = () => {
      console.log("Disconnected from Bitquery.");
      setIsConnected(false);
    };

    bitqueryConnection.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setError(error); // Update state with WebSocket errors
    };

    // Cleanup function to close WebSocket connection on unmount
    return () => {
      bitqueryConnection.close();
    };
  }, [bitqueryUrl]);

  return (
    <div>
      <h2>Bitquery WebSocket Example</h2>
      <p>Connection Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p style={{ color: "red" }}>Error: {JSON.stringify(error)}</p>}
      {/* {data &bitqueryConnection */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Time</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Transaction Hash</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Buy Currency</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Buy Amount</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Sell Currency</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Sell Amount</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>DEX Protocol</th>
          </tr>
        </thead>
        <tbody>
          {(data?.EVM?.DEXTrades ?? []).map((trade, index) => (
            <tr key={index} style={{ border: "1px solid #ddd" }}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trade.Block.Time}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trade.Transaction.Hash}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {trade.Trade.Buy.Currency.Symbol} ({trade.Trade.Buy.Currency.Name})
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {trade.Trade.Buy.Amount} (${trade.Trade.Buy.AmountInUSD})
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {trade.Trade.Sell.Currency.Symbol} ({trade.Trade.Sell.Currency.Name})
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {trade.Trade.Sell.Amount} (${trade.Trade.Sell.AmountInUSD})
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {trade.Trade.Dex.ProtocolName} v{trade.Trade.Dex.ProtocolVersion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BitqueryWebSocketComponent;