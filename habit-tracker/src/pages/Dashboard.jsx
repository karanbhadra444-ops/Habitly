import {useState,useEffect} from 'react';
import "../index.css";
function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userInitial = user?.username?.charAt(0).toUpperCase() || "U";
  const[habit,setHabit]=useState("")
  
  const [habits, setHabits] = useState([]);
  useEffect(() => {
  fetch("http://localhost:5000/habits", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then((res) => res.json())
    .then((data) => {
      setHabits(data);
    });
}, []); 

  const[completedToday,setCompletedToday]=useState(0);

  const[editIndex,setEditIndex]=useState(null)
  const[search,setSearch]=useState("")
  const [goal, setGoal] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const addHabit = async () => {
  if (habit.trim() === "") return;
  const newHabit = {
    text: habit,
    history: {},
  };

 const response = await fetch("http://localhost:5000/habits", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  },
  body: JSON.stringify(newHabit)
});                                 

  const data = await response.json();

  setHabits(data.habits);
  setHabit("");
};

 const toggleComplete = async (id) => {
  const today = new Date().toISOString().split("T")[0];

  const updated = habits.map((habit) => {
    if (habit._id === id) {
      const newHistory = { ...(habit.history || {}) };

      if (newHistory[today]) {
        delete newHistory[today];
      } else {
        newHistory[today] = true;
      }

      return {
        ...habit,
        history: newHistory,
      };
    }
    return habit;
  });

  setHabits(updated);

  const updatedHabit = updated.find((h) => h._id === id);
  await saveHabit(updatedHabit);
};

const deleteHabit = async (id) => {
  const response = await fetch(
    `http://localhost:5000/habits/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
  if (!response.ok) {
    console.error("Failed to delete habit");
    return;
  }
  const data = await response.json();
  setHabits(data.habits || data);
};

 const saveHabit = async (habitToSave) => {
  const response = await fetch(
    `http://localhost:5000/habits/${habitToSave._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(habitToSave)
    }
  );
  await response.json();
  setHabits((prev) =>
    prev.map((h) =>
      h._id === habitToSave._id ? habitToSave : h
    )
  );
  setEditIndex(null);
};  

  const getStreak = (habit) => {
    let count=0;
    let currentDate= new Date();

    while(true) {
      const dateStr = currentDate.toISOString().split("T")[0];

      if(habit.history && habit.history[dateStr])  {
        count++;
        currentDate.setDate(currentDate.getDate()-1);
      }else {
        break;
      }
    }
    return count;
  }


  const getWeeklyProgress =(habit) => {
    let count =0;
    let currentDate= new Date();

    for(let i=0;i<7;i++) {
      const dateStr =currentDate.toISOString().split("T")[0];

      if(habit.history && habit.history[dateStr]) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() -1);
    }
    return count;
  }
  
  useEffect(() => {
  fetch("http://localhost:5000/stats/completed-today", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then((res) => res.json())
    .then((data) => {
      setCompletedToday(data.completedToday);
    });
}, [habits]);

  const getSuggestions = async () => {
  const res = await fetch("http://localhost:5000/ai-suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goal }),
  });

  const data = await res.json();
  setSuggestions(data.suggestions);
};

const [openProfile, setOpenProfile] = useState(false);

useEffect(() => {
  const handleClickOutside = () => setOpenProfile(false);

  document.addEventListener("click", handleClickOutside);

  return () => {
    document.removeEventListener(
      "click",
      handleClickOutside
    );
  };
}, []);
  
  //console.log(habits);
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
    {/* Top bar */}
    <header className="border-b border-white/5 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">H</div>
          <span className="font-semibold tracking-tight">Habitly</span>
        </div>

        <div className="flex items-center gap-4">
  
  <div className="relative">
  {/* Avatar button */}
  <button
    onClick={(e) => {
    e.stopPropagation();
    setOpenProfile(!openProfile);
  }}
    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold hover:scale-105 transition"
  >
    {userInitial}
  </button>

  {/* Dropdown */}
  {openProfile && (
    <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
      
      <div className="px-4 py-2 text-sm text-slate-300 border-b border-white/10">
        {user?.username || "User"}
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
      >
        Logout
      </button>
    </div>
  )}
    </div>
      </div>
    </div>
    </header>

    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Today</h1>
        <p className="text-slate-400 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Completed today</p>
          <p className="text-3xl font-bold mt-2">{completedToday}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total habits</p>
          <p className="text-3xl font-bold mt-2">{habits.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Best streak</p>
          <p className="text-3xl font-bold mt-2">
           {habits.reduce((m, h) => Math.max(m, getStreak(h)), 0)}d
          </p>
        </div>
      </div>

      <div className="mb-6 bg-white/[0.03] border border-white/10 rounded-2xl p-4">

        <h2 className="text-lg font-semibold mb-2">
          AI Habit Coach 🤖
        </h2>

        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. lose weight, be productive"
          className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 mb-3"
        />
        <button
          onClick={getSuggestions}
          className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-xl text-sm"
        >
          Get Suggestions
        </button>

        <div className="mt-4 space-y-2">
        {suggestions
        .split("\n")
        .filter((s) => s.trim() !== "")
        .map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white/5 p-3 rounded-xl"
          >
            <span className="text-sm">
              {s.replace("*", "")}
            </span>

            <button
              onClick={() => {
                setHabit(s.replace("*", "").trim());
              }}
              className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded-lg text-xs"
            >
              Add
            </button>
          </div>
        ))}
      </div>  

      </div>
      
      {/* Add + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="New habit (e.g. Read 20 minutes)"
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500/60 focus:bg-white/[0.05] transition"
        />
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-56 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-500/60 transition"
        />
        <button
          onClick={addHabit}
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-5 py-3 rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          Add habit
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {habits
          .filter((h) => h.text.toLowerCase().includes(search.toLowerCase()))
          .sort((a, b) => getStreak(b) - getStreak(a))
          .map((h, index) => {
            const today = new Date().toISOString().split("T")[0];
            const doneToday = h.history && h.history[today];
            const weekly = getWeeklyProgress(h);
            return (
              <li
                key={h._id}
                className="group bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.05] hover:border-white/20 transition"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(h._id)}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    doneToday
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-600 hover:border-emerald-400"
                  }`}
                >
                  {doneToday && <span className="text-white text-xs">✓</span>}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editIndex === index ? (
                    <input
                      value={h.text}
                      onChange={(e) => {
                        const updated = [...habits];
                        updated[index].text = e.target.value;
                        setHabits(updated);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && saveHabit(h)}
                      autoFocus
                      className="w-full bg-white/10 border border-blue-500/60 rounded-lg px-3 py-1.5 text-sm outline-none"
                    />
                  ) : (
                    <p className={`font-medium truncate ${doneToday ? "text-slate-400 line-through" : "text-white"}`}>
                      {h.text}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="text-orange-400">🔥</span> {getStreak(h)} day streak
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{weekly}/7 this week</span>
                    <div className="flex-1 max-w-[120px] h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${(weekly / 7) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions (subtle, only on hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  {editIndex === index ? (
                    <button
                      onClick={() => saveHabit(h)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditIndex(index)}
                      className="text-xs px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    onClick={() => deleteHabit(h._id)}
                    className="text-xs px-2 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}

        {habits.length === 0 && (
          <li className="text-center py-16 text-slate-500 border border-dashed border-white/10 rounded-2xl">
            No habits yet. Add your first one above.
          </li>
        )}
      </ul>
    </main>
  </div>
);

}
export default Dashboard;