export default function Row({ item, deleteTask }) {
  return (
    <li className="task-row">
      <span className="task-text">{item.description}</span>
      <button
        type="button"
        className="delete-button"
        onClick={() => deleteTask(item.id)}
      >
        Delete
      </button>
    </li>
  );
}