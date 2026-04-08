export default function Sidebar({ chats, onSelect, onDelete }) {
  return (
    <div
      style={{
        width: 250,
        borderRight: "1px solid #ccc",
        padding: 10,
      }}
    >
      <h3>Chats</h3>

      {chats.map((chat) => (
        <div
          key={chat.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            cursor: "pointer",
          }}
        >
          <span onClick={() => onSelect(chat.id)}>
            {chat.title}
          </span>

          <button onClick={() => onDelete(chat.id)}>X</button>
        </div>
      ))}
    </div>
  );
}