"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import anime from "animejs";
type Message = {
  id: string;
  role: "user" | "bot" | "mahasiswa" | "dosen" | string;
  content: string;
};

type Ticket = {
  id: string;
  nama: string;
  nim: string;
  subject: string;
  status: "Open" | "In Progress" | "Closed";
  date: string; // Format YYYY-MM-DD
  nama_layanan?: string;
};

function RobotMascot({ isFocused }: { isFocused: boolean }) {
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);
  const eyeLineRef = useRef<SVGGElement>(null);
  const openEyesRef = useRef<SVGGElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  // Refs for the white eye whites
  const leftWhiteRef = useRef<SVGCircleElement>(null);
  const rightWhiteRef = useRef<SVGCircleElement>(null);
  // Ref for the dark red visor rect
  const visorRef = useRef<SVGRectElement>(null);

  // Efek untuk pergerakan mata + visor + mulut mengikuti kursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isFocused) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Pupils move the most
      const pupilX = Math.max(
        -6,
        Math.min(6, (e.clientX - windowWidth / 2) / 100),
      );
      const pupilY = Math.max(
        -4,
        Math.min(4, (e.clientY - windowHeight / 2) / 100),
      );

      // Eye whites move a bit less than pupils
      const whiteX = Math.max(
        -4,
        Math.min(4, (e.clientX - windowWidth / 2) / 140),
      );
      const whiteY = Math.max(
        -3,
        Math.min(3, (e.clientY - windowHeight / 2) / 140),
      );

      // Visor and mouth move subtly — just a slight lean
      const visorX = Math.max(
        -2,
        Math.min(2, (e.clientX - windowWidth / 2) / 250),
      );
      const visorY = Math.max(
        -1.5,
        Math.min(1.5, (e.clientY - windowHeight / 2) / 250),
      );

      // Pupils
      anime({
        targets: [leftPupilRef.current, rightPupilRef.current],
        translateX: pupilX,
        translateY: pupilY,
        duration: 800,
        easing: "easeOutElastic(1, .5)",
      });

      // Eye whites
      anime({
        targets: [leftWhiteRef.current, rightWhiteRef.current],
        translateX: whiteX,
        translateY: whiteY,
        duration: 900,
        easing: "easeOutElastic(1, .4)",
      });

      // Visor (dark red rect)
      anime({
        targets: visorRef.current,
        translateX: visorX,
        translateY: visorY,
        duration: 1000,
        easing: "easeOutQuad",
      });

      // Mouth follows with same subtle movement as visor
      anime({
        targets: mouthRef.current,
        translateX: visorX,
        translateY: visorY,
        duration: 1000,
        easing: "easeOutQuad",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isFocused]);

  // Efek transisi saat fokus (memejamkan mata) dengan Anime.js
  useEffect(() => {
    if (isFocused) {
      anime({
        targets: openEyesRef.current,
        opacity: 0,
        scaleY: 0.1,
        duration: 200,
        easing: "easeOutQuad",
      });
      anime({
        targets: eyeLineRef.current,
        opacity: 1,
        duration: 300,
        delay: 100,
        easing: "easeInQuad",
      });
      // Mulut kembali lurus saat mata terpejam
      anime({
        targets: mouthRef.current,
        d: [{ value: "M45 74 Q60 74 75 74" }],
        duration: 200,
        easing: "easeOutQuad",
      });
    } else {
      anime({
        targets: eyeLineRef.current,
        opacity: 0,
        duration: 200,
        easing: "easeOutQuad",
      });
      anime({
        targets: openEyesRef.current,
        opacity: 1,
        scaleY: 1,
        duration: 400,
        delay: 100,
        easing: "easeOutElastic(1, .6)",
      });
      // Mulut tersenyum saat mata terbuka
      anime({
        targets: mouthRef.current,
        d: [{ value: "M45 72 Q60 82 75 72" }],
        duration: 400,
        delay: 150,
        easing: "easeOutElastic(1, .6)",
      });
    }
  }, [isFocused]);

  return (
    <div className="flex justify-center mb-6">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="58" y="5" width="4" height="15" fill="#B91C1C" />
        <circle cx="60" cy="5" r="4" fill="#EF4444" />
        <rect
          x="25"
          y="20"
          width="70"
          height="65"
          rx="10"
          fill="#EF4444"
          stroke="#B91C1C"
          strokeWidth="3"
        />

        {/* Visor gelap (mengikuti kursor sedikit) */}
        <rect
          ref={visorRef}
          x="35"
          y="35"
          width="50"
          height="25"
          rx="5"
          fill="#7F1D1D"
        />

        {/* Grup Mata Terbuka */}
        <g ref={openEyesRef} style={{ transformOrigin: "60px 47px" }}>
          {/* Eye whites (mengikuti kursor sedang) */}
          <circle ref={leftWhiteRef} cx="47" cy="47" r="8" fill="white" />
          <circle ref={rightWhiteRef} cx="73" cy="47" r="8" fill="white" />
          {/* Pupils (mengikuti kursor paling banyak) */}
          <circle ref={leftPupilRef} cx="47" cy="47" r="4" fill="black" />
          <circle ref={rightPupilRef} cx="73" cy="47" r="4" fill="black" />
        </g>

        {/* Grup Mata Terpejam (Awalnya tersembunyi) */}
        <g ref={eyeLineRef} opacity="0">
          <path
            d="M40 47H54"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <path
            d="M66 47H80"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </g>

        {/* Mulut (mengikuti kursor sedikit + animasi senyum) */}
        <path
          ref={mouthRef}
          d="M45 72 Q60 82 75 72"
          stroke="#B91C1C"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function App() {
  // ==========================================
  // STATE UNTUK LOGIN
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nimNip, setNimNip] = useState("");
  const [userName, setUserName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // State untuk mengontrol dropdown 3 titik pada riwayat chat
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Efek ini berguna agar dropdown otomatis tertutup jika user mengklik area lain di layar
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // State untuk Fitur Chat Tiket
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // State untuk Pop-Up Forgot Password
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotNimInput, setForgotNimInput] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // State untuk menyimpan password
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("");

  // State untuk data email dan proses update
  const [userEmail, setUserEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(""); // Untuk pesan sukses/error ubah password

  // State untuk menyimpan sessionId yang akan digunakan untuk mengelompokkan riwayat chat di database
  const [currentSessionId, setCurrentSessionId] = useState(
    Date.now().toString(),
  );

  // State untuk modal dan input tiket baru
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // [KODE BARU]: State Layanan Master
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState("");

  // State untuk interaksi robot
  const [isInputFocused, setIsInputFocused] = useState(false);

  // State untuk Pop-Up Reset Password
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    // Mengecek URL di browser (hanya berjalan di sisi klien)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      if (tokenFromUrl) {
        setResetToken(tokenFromUrl);
      }
    }
  }, []);

  // ==========================================
  // STATE UNTUK SIDEBAR & NAVIGASI
  // ==========================================
  const [activeMenu, setActiveMenu] = useState<"chatbot" | "tiket" | "akun">(
    "chatbot",
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ==========================================
  // STATE UNTUK CHATBOT
  // ==========================================
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Halo! Saya asisten Helpdesk Akademik LAA FTE. Ada yang bisa saya bantu hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // STATE UNTUK HALAMAN TIKET
  // ==========================================
  const [searchTicket, setSearchTicket] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  type ChatSession = { sessionId: string; title: string };
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const [tickets, setTickets] = useState<Ticket[]>([]);

  // ==========================================
  // [KODE BARU MULAI SINI]: FUNGSI AMBIL DATA DB
  // ==========================================
  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`/api/chat?nimNip=${nimNip}`); // Tanpa sessionId
      const result = await res.json();

      if (
        result.status === "success" &&
        result.data &&
        result.data.length > 0
      ) {
        // Ambil data dari backend dan jadikan kalimat pertama sebagai judul riwayat
        const sessions = result.data
          .map((m: any) => ({
            sessionId: m.session_id,
            title:
              m.content.length > 25
                ? m.content.substring(0, 25) + "..."
                : m.content,
          }))
          .reverse();
        setChatSessions(sessions);
      }
    } catch (err) {
      console.error("Gagal mengambil daftar sesi:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tickets?nim=${nimNip}`);
      const result = await res.json();

      if (result.status === "success" && result.data) {
        const formattedTickets = result.data.map((t: any) => ({
          ...t,
          // Tangkap 'created_at' dari database, lalu ubah jadi format 'date' untuk frontend
          date: t.created_at
            ? new Date(t.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        }));
        setTickets(formattedTickets);
      } else {
        // Jika belum ada tiket sama sekali di database
        setTickets([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data tiket:", err);
      setTickets([]);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/services?role=${userRole}`);
      const result = await res.json();
      if (result.status === "success") {
        setServices(result.data);
      }
    } catch (err) {
      console.error("Gagal memuat master layanan:", err);
    }
  };

  // Jalankan fungsi fetch otomatis ketika berhasil login
  useEffect(() => {
    if (isLoggedIn) {
      fetchChatHistory();
      fetchTickets();
      fetchServices(); // <--- [KODE BARU]: Panggil di sini
    }
  }, [isLoggedIn]);

  // Jalankan fungsi fetch otomatis ketika berhasil login
  useEffect(() => {
    if (isLoggedIn) {
      fetchChatHistory();
      fetchTickets();
    }
  }, [isLoggedIn]);

  // Fungsi untuk memuat sesi chat tertentu ke layar utama berdasarkan sessionId yang dipilih di sidebar
  const loadSpecificSession = async (sessionId: string) => {
    try {
      const res = await fetch(
        `/api/chat?nimNip=${nimNip}&sessionId=${sessionId}`,
      );
      const result = await res.json();

      if (result.status === "success") {
        const historyMessages = result.data.map((m: any, index: number) => ({
          id: m.id ? m.id.toString() : `hist-${index}-${Date.now()}`,
          role: m.role,
          content: m.content,
        }));

        setMessages(historyMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (err) {
      console.error("Gagal memuat sesi:", err);
    }
  };

  // Fungsi Hapus Sesi Chat
  const handleDeleteChatSession = async (
    sessionId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Mencegah klik men-trigger buka chat
    if (!confirm("Yakin ingin menghapus riwayat percakapan ini?")) return;

    try {
      const res = await fetch(
        `/api/chat?nimNip=${nimNip}&sessionId=${sessionId}`,
        {
          method: "DELETE",
        },
      );
      const result = await res.json();
      if (result.status === "success") {
        // Jika chat yang dihapus adalah chat yang sedang dibuka di layar, bersihkan layarnya
        if (currentSessionId === sessionId) {
          setMessages([
            {
              id: "welcome",
              role: "bot",
              content:
                "Halo! Saya asisten Helpdesk Akademik LAA FTE. Ada yang bisa saya bantu hari ini?",
            },
          ]);
          setCurrentSessionId(Date.now().toString());
        }
        fetchChatHistory(); // Refresh daftar di sidebar
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert("Gagal menghapus percakapan.");
    }
  };

  // Fungsi untuk memuat riwayat percakapan ke layar utama saat pengguna memilih salah satu riwayat di sidebar
  const loadConversationHistory = async () => {
    try {
      // Ambil data riwayat dari database berdasarkan NIM
      const res = await fetch(`/api/chat?nimNip=${nimNip}`);
      const result = await res.json();

      if (result.status === "success" && result.data.length > 0) {
        // Format ulang data dari database agar sesuai dengan tipe 'Message' Next.js
        const historyMessages = result.data.map((m: any, index: number) => ({
          // Jika m.id ada, jadikan string. Jika tidak ada, buat ID acak menggunakan index dan waktu
          id: m.id ? m.id.toString() : `history-${index}-${Date.now()}`,
          role: m.role,
          content: m.content,
        }));

        // Ganti isi layar utama dengan riwayat dari database
        setMessages([
          {
            id: "welcome-history",
            role: "bot",
            content: "Menampilkan riwayat percakapan Anda sebelumnya.",
          },
          ...historyMessages,
        ]);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat chat:", err);
    }
  };

  // Logika untuk menyaring tiket berdasarkan pencarian, tanggal, dan status
  const filteredTickets = tickets.filter((ticket) => {
    // 1. Filter Pencarian (ID & Subjek)
    const matchSearch =
      ticket.subject.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTicket.toLowerCase());

    // 2. Filter Tanggal
    const matchDate = filterDate ? ticket.date === filterDate : true;

    // 3. Filter Status
    const matchStatus =
      filterStatus === "All" ? true : ticket.status === filterStatus;

    return matchSearch && matchDate && matchStatus;
  });

  // ==========================================
  // FUNGSI HANDLE LOGIN (SUDAH CONNECT DATABASE)
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nimNip, password }), // Mengirim nimNip dan password ke API
      });

      const result = await res.json();

      if (result.status === "success") {
        setUserName(result.data.nama);
        setUserRole(result.data.role); // Simpan role dari database
        setUserEmail(result.data.email || ""); // Ambil email dari DB jika ada
        setIsLoggedIn(true);
      } else {
        setLoginError(result.message);
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke server database.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ==========================================
  // FUNGSI HANDLE SUBMIT TIKET BARU
  // ==========================================
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi agar user wajib memilih layanan
    if (!selectedService) {
      alert("Silakan pilih jenis layanan terlebih dahulu!");
      return;
    }

    setIsSubmittingTicket(true);

    const newTicketData = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      nim: nimNip,
      nama: userName,
      layanan_id: selectedService,
      subject: newTicketSubject,
      description: newTicketDescription,
      status: "Open",
    };

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicketData),
      });

      if (res.ok) {
        alert("Tiket berhasil dibuat!");
        setIsTicketModalOpen(false);
        setSelectedService("");
        setNewTicketSubject("");
        setNewTicketDescription("");
        fetchTickets(); // Refresh daftar tiket di tabel
      }
    } catch (err) {
      console.error("Gagal membuat tiket:", err);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Fungsi membuka modal tiket dan mengambil riwayat pesannya
  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketMessages([]); // Kosongkan layar chat sementara loading
    try {
      const res = await fetch(`/api/tickets/messages?ticketId=${ticket.id}`);
      const result = await res.json();
      if (result.status === "success") {
        setTicketMessages(result.data);
      }
    } catch (error) {
      console.error("Gagal memuat pesan tiket:", error);
    }
  };

  //===========================================
  // Fungsi mengirim pesan balasan dari User
  //===========================================
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedTicket) return;
    setIsSendingReply(true);

    try {
      const res = await fetch("/api/tickets/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          sender_type: "user",
          sender_id: null,
          sender_name: userName,
          message: replyInput,
        }),
      });

      const result = await res.json();
      if (result.status === "success") {
        // Tambahkan pesan baru ke layar tanpa perlu refresh
        setTicketMessages((prev) => [...prev, result.data]);
        setReplyInput("");
      }
    } catch (error) {
      alert("Gagal mengirim pesan.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // ==========================================
  // FUNGSI HANDLE CHAT
  // ==========================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userContent = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: userRole ? userRole.toLowerCase() : "user",
      content: userContent,
    };

    // Ekstrak sedikit riwayat pesan untuk diberikan ke bot agar memahami konteks obrolan
    // Jangan semua pesan dikirim untuk menghemat bandwidth dan memori Ollama
    const chatHistoryContext = (() => {
      // Filter pesan welcome & konversi role "bot" → "assistant"
      const filtered = messages
        .filter((msg) => !msg.id.startsWith("welcome"))
        .slice(-6)
        .map((msg) => ({
          role: msg.role === "bot" ? "assistant" : "user",
          content: msg.content,
        }));

      // Pastikan role alternating (tidak ada dua role sama berturut-turut)
      const alternating: { role: string; content: string }[] = [];
      for (const msg of filtered) {
        if (
          alternating.length === 0 ||
          alternating[alternating.length - 1].role !== msg.role
        ) {
          alternating.push(msg);
        }
      }

      // Pastikan diawali dengan "user"
      while (alternating.length > 0 && alternating[0].role !== "user") {
        alternating.shift();
      }

      return alternating;
    })();

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Simpan pesan USER
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nimNip,
          sessionId: currentSessionId, // Gunakan ID sesi aktif
          role: userRole ? userRole.toLowerCase() : "user",
          content: userContent,
        }),
      });

      fetchChatHistory();

      // 2. Kirim ke Backend FastAPI Python Anda
      // Pastikan URL (http://localhost:8000) disesuaikan dengan port server Python yang sedang berjalan
      const response = await fetch("http://localhost:8000/api/chat-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userContent,
          user_mode: userRole || "Mahasiswa", // Kirim role user agar diproses sesuai filter di Python
          history: chatHistoryContext, // Kirim riwayat obrolan terbaru
        }),
      });

      const data = await response.json();
      const botContent =
        data.output ||
        "Maaf, saya sedang tidak bisa memproses permintaan Anda.";

      // 3. Simpan pesan BOT (Berhasil)
      saveBotReply(botContent);
    } catch (error) {
      const errorMsg = "Terjadi kesalahan jaringan. Silakan coba lagi.";
      // 4. Simpan pesan BOT (Meskipun Error)
      saveBotReply(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi pembantu untuk menyimpan reply bot
  const saveBotReply = async (content: string) => {
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      content,
    };
    setMessages((prev) => [...prev, botMessage]);

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nimNip,
        sessionId: currentSessionId,
        role: "bot",
        content: content,
      }),
    });
  };
  // Fungsi untuk mereset sesi chat (Chat Baru)
  const handleNewChat = () => {
    if (confirm("Mulai percakapan baru?")) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          content: "Halo! Ada yang bisa saya bantu?",
        },
      ]);
      // Generate ID unik baru (bisa pakai timestamp)
      setCurrentSessionId(Date.now().toString());
    }
  };

  // ==========================================
  // TAMPILAN 1: HALAMAN LOGIN (Jika belum login)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <>
        <main className="flex items-center justify-center h-screen bg-gray-50 px-4 relative z-10">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            {/* [KODE BARU]: Panggil Komponen Robot di sini */}
            <RobotMascot isFocused={isInputFocused} />
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-red-700 mb-2">
                Helpdesk LAA FTE
              </h1>
              <p className="text-gray-500 text-sm">
                Silakan login untuk mengakses layanan kami
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="nimNip"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  NIM Mahasiswa / NIP Dosen
                </label>
                <input
                  id="nimNip"
                  type="text"
                  autoComplete="off"
                  value={nimNip}
                  onChange={(e) => setNimNip(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Masukkan NIM atau NIP..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Masukkan password..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-70 flex justify-center items-center"
              >
                {isLoggingIn ? "Memeriksa..." : "Masuk"}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-sm text-red-600 hover:underline font-medium"
                >
                  Lupa Password?
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* POP-UP FORM RESET PASSWORD (MUNCUL DI HALAMAN LOGIN) */}
        {resetToken && (
          <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center px-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Buat Password Baru
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Silakan masukkan password baru untuk akun Anda.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUpdatingPassword(true);
                  try {
                    const res = await fetch("/api/auth/update-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: resetToken, newPassword }),
                    });
                    const result = await res.json();

                    if (result.status === "success") {
                      alert(
                        "Password berhasil diubah! Silakan login menggunakan password baru.",
                      );
                      setResetToken(null);
                      setNewPassword("");
                      window.history.replaceState({}, document.title, "/");
                    } else {
                      alert(result.message);
                    }
                  } catch (err) {
                    alert("Gagal menghubungi server.");
                  } finally {
                    setIsUpdatingPassword(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition"
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-md mt-2"
                >
                  {isUpdatingPassword ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </form>
            </div>
          </div>
        )}
        {isForgotModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center px-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Reset Password
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan NIM/NIP Anda. Kami akan mengirimkan link reset ke email
                yang terdaftar.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Masukkan NIM atau NIP..."
                  value={forgotNimInput}
                  onChange={(e) => setForgotNimInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    disabled={isSendingReset || !forgotNimInput}
                    onClick={async () => {
                      setIsSendingReset(true);
                      try {
                        const res = await fetch("/api/auth/reset-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ nimNip: forgotNimInput }),
                        });
                        const result = await res.json();
                        if (result.status === "success") {
                          alert(
                            "Link reset password telah dikirim ke email Anda. Silakan cek Inbox/Spam.",
                          );
                          setIsForgotModalOpen(false);
                          setForgotNimInput(""); // Bersihkan input
                        } else {
                          alert(result.message);
                        }
                      } catch (err) {
                        alert("Gagal menghubungi server.");
                      } finally {
                        setIsSendingReset(false);
                      }
                    }}
                    className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    {isSendingReset ? "Mengirim..." : "Kirim Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // TAMPILAN 2: DASHBOARD (Sidebar + Area Utama)
  // ==========================================
  return (
    <div className="flex h-screen bg-gray-100 font-sans relative overflow-hidden">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* BAGIAN ATAS: PROFIL LENGKAP */}
          <div className="relative p-6 flex flex-col items-center border-b border-gray-100 bg-gray-50/30">
            {/* Tombol Close untuk Mobile */}
            <button
              className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-red-600 focus:outline-none"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Foto Profil Bulat */}
            <div className="w-20 h-20 rounded-full border-2 border-red-600 p-1 mb-3 shadow-md bg-white">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${userName}&background=E11D48&color=fff&bold=true`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Informasi Nama & NIM (Klik Nama untuk masuk ke Profil) */}
            <div className="text-center">
              <h2
                onClick={() => {
                  setActiveMenu("akun");
                  setIsMobileSidebarOpen(false);
                }}
                className="text-lg font-bold text-gray-800 leading-tight cursor-pointer hover:text-red-600 transition-colors"
                title="Klik untuk lihat profil"
              >
                {userName}
              </h2>
              <p className="text-sm text-gray-500 font-medium">{nimNip}</p>
              {/* ubah nanti kalau udah connect ke database biar bisa bedain mahasiswa / dosen */}
              <div className="mt-2 inline-block px-3 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {userRole || "User"}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Menu Utama
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveMenu("chatbot");
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-medium transition flex items-center gap-3 ${
                    activeMenu === "chatbot"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => {
                    setActiveMenu("tiket");
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-medium transition flex items-center gap-3 ${
                    activeMenu === "tiket"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  🎫 Daftar Tiket
                </button>
              </nav>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Layanan Cepat
              </p>
              <ul className="space-y-1 text-sm">
                <li>
                  <a
                    href="https://igracias.telkomuniversity.ac.id/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg transition"
                  >
                    🔗 iGracias Tel-U
                  </a>
                </li>
                <li>
                  <a
                    href="https://lms.telkomuniversity.ac.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg transition"
                  >
                    🔗 CeLOE LMS
                  </a>
                </li>
                <li>
                  <a
                    href="https://linktr.ee/laa.fte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg transition"
                  >
                    🔗 Web Fakultas
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Riwayat Chat
              </p>
              <ul className="space-y-1 text-sm">
                {chatSessions.length > 0 ? (
                  chatSessions.map((session, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition group ${
                        currentSessionId === session.sessionId
                          ? "bg-red-50 text-red-700"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        loadSpecificSession(session.sessionId);
                        setIsMobileSidebarOpen(false);
                      }}
                    >
                      <div className="flex-1 truncate flex items-center gap-2">
                        <span>💬</span>
                        <span className="truncate">{session.title}</span>
                      </div>
                      <div className="relative flex items-center ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            setOpenDropdownId(
                              openDropdownId === session.sessionId
                                ? null
                                : session.sessionId,
                            );
                          }}
                          className="p-1.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600 transition"
                          title="Opsi"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                            />
                          </svg>
                        </button>

                        {/* Kotak Dropdown Menu */}
                        {openDropdownId === session.sessionId && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-[999] overflow-hidden">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null); // Tutup dropdown
                                handleDeleteChatSession(session.sessionId, e); // Jalankan fungsi hapus
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-400 italic text-xs">
                    Belum ada riwayat chat
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="p-6 border-t border-gray-100 bg-white">
            <h1 className="text-xl font-bold text-red-700 tracking-tight">
              LAA FTE
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              Telkom University
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100">
        {activeMenu === "chatbot" ? (
          <div className="flex flex-col h-full max-w-4xl w-full mx-auto bg-white shadow-sm border-x border-gray-200">
            <header className="bg-red-700 text-white p-4 sm:p-5 flex items-center shadow-sm z-10 gap-4">
              <button
                className="md:hidden p-1 rounded hover:bg-red-800 transition focus:outline-none"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
              <div className="flex-1">
                <h2 className="text-lg font-bold truncate">
                  Asisten Virtual LAA FTE
                </h2>
                <p className="text-sm opacity-80 truncate">Layanan Helpdesk</p>
              </div>

              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded-lg transition border border-red-500/30 text-sm font-medium shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="hidden sm:inline">Chat Baru</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  // [KODE BARU]: Ubah kondisi menjadi !== "bot"
                  className={`flex ${
                    msg.role !== "bot" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] p-4 rounded-xl shadow-sm ${
                      msg.role !== "bot"
                        ? "bg-red-600 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.role !== "bot" ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <div className="space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:font-bold [&>p]:mb-1 [&>p]:whitespace-pre-wrap">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-500 p-4 rounded-xl rounded-bl-none italic text-sm shadow-sm flex space-x-2">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white flex gap-2 md:gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan anda di sini..."
                className="flex-1 border border-gray-300 rounded-xl px-4 md:px-5 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm md:text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-8 py-3 rounded-xl font-medium transition disabled:opacity-50 shadow-sm"
              >
                <span className="hidden md:inline">Kirim</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 md:hidden inline"
                >
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              </button>
            </form>
          </div>
        ) : activeMenu === "tiket" ? (
          <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">
            <header className="md:hidden bg-red-700 text-white p-4 sm:p-5 flex items-center shadow-sm z-10 gap-4 flex-shrink-0">
              <button
                className="p-1 rounded hover:bg-red-800 transition focus:outline-none"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-bold truncate">Halaman Tiket</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Daftar Tiket
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Pantau status laporan dan pertanyaan Anda
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Buat Tiket Baru
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchTicket}
                      onChange={(e) => setSearchTicket(e.target.value)}
                      placeholder="Cari berdasarkan ID atau Subjek..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    />
                  </div>

                  <div className="w-full md:w-40 relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-gray-600 bg-white appearance-none cursor-pointer"
                    >
                      <option value="All">Semua Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  <div className="w-full md:w-auto">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition text-gray-600"
                    />
                  </div>

                  {(searchTicket || filterDate || filterStatus !== "All") && (
                    <button
                      onClick={() => {
                        setSearchTicket("");
                        setFilterDate("");
                        setFilterStatus("All");
                      }}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-4 font-medium">ID Tiket</th>
                          <th className="px-6 py-4 font-medium">NIM</th>
                          <th className="px-6 py-4 font-medium">Nama</th>
                          <th className="px-6 py-4 font-medium">Kategori</th>
                          <th className="px-6 py-4 font-medium">
                            Subjek / Masalah
                          </th>
                          <th className="px-6 py-4 font-medium">
                            Tanggal Dibuat
                          </th>
                          <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {filteredTickets.length > 0 ? (
                          filteredTickets.map((ticket) => (
                            <tr
                              key={ticket.id}
                              onClick={() => handleViewTicket(ticket)}
                              className="hover:bg-gray-100 transition cursor-pointer"
                              title="Klik untuk melihat percakapan"
                            >
                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {ticket.id}
                              </td>
                              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                {ticket.nim}
                              </td>
                              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                {ticket.nama}
                              </td>

                              {/* [KODE BARU]: Tampilkan Kategori Layanan */}
                              <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap text-red-600">
                                {ticket.nama_layanan || "Umum"}
                              </td>

                              <td className="px-6 py-4 text-gray-600">
                                {ticket.subject}
                              </td>
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                {new Date(ticket.date).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    ticket.status === "Open"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : ticket.status === "In Progress"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-green-50 text-green-700 border-green-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      ticket.status === "Open"
                                        ? "bg-blue-600"
                                        : ticket.status === "In Progress"
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                    }`}
                                  ></span>
                                  {ticket.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-12 text-center text-gray-500"
                            >
                              Tidak ada tiket yang cocok dengan pencarian /
                              filter tersebut.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* [KODE BARU]: Modal Form Tiket Diletakkan Di Sini */}
            {isTicketModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 md:p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Buat Tiket Baru
                  </h3>
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    {/* [KODE BARU]: Dropdown Pilihan Layanan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori Layanan
                      </label>
                      <select
                        required
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white cursor-pointer text-gray-700"
                      >
                        <option value="">-- Pilih Layanan --</option>
                        {services.map((svc) => (
                          <option key={svc.id} value={svc.id}>
                            {svc.nama_layanan}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subjek / Judul
                      </label>
                      <input
                        type="text"
                        required
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        placeholder="Contoh: Kendala iGracias"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi Masalah
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newTicketDescription}
                        onChange={(e) =>
                          setNewTicketDescription(e.target.value)
                        }
                        placeholder="Jelaskan detail masalah Anda..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsTicketModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingTicket}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        {isSubmittingTicket ? "Mengirim..." : "Kirim Tiket"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* [KODE BARU]: Modal Percakapan Tiket */}
            {selectedTicket && (
              <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center px-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col h-[80vh] overflow-hidden relative">
                  {/* Header Modal */}
                  <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedTicket.id} - {selectedTicket.subject}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Status: {selectedTicket.status}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-400 hover:text-red-600 p-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Area Chat */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {ticketMessages.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm italic mt-10">
                        Belum ada percakapan pada tiket ini.
                      </p>
                    ) : (
                      ticketMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                              msg.sender_type === "user"
                                ? "bg-red-600 text-white rounded-br-none"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p className="text-xs opacity-75 mb-1 font-semibold">
                              {msg.sender_name}{" "}
                              {msg.sender_type === "admin" && "🛡️"}
                            </p>
                            <p className="text-sm">{msg.message}</p>

                            {/* Indikator Waktu dan Centang Terkirim/Dibaca */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-80">
                              <p>
                                {new Date(msg.created_at).toLocaleTimeString(
                                  "id-ID",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>

                              {msg.sender_type === "user" && (
                                <span>
                                  {msg.is_read ? (
                                    <div
                                      className="flex -space-x-1.5 text-blue-300"
                                      title="Dibaca"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={3}
                                        stroke="currentColor"
                                        className="w-3 h-3"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4.5 12.75l6 6 9-13.5"
                                        />
                                      </svg>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={3}
                                        stroke="currentColor"
                                        className="w-3 h-3"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4.5 12.75l6 6 9-13.5"
                                        />
                                      </svg>
                                    </div>
                                  ) : (
                                    <span title="Terkirim">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={3}
                                        stroke="currentColor"
                                        className="w-3 h-3 opacity-70"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M4.5 12.75l6 6 9-13.5"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form Kirim Balasan */}
                  {selectedTicket.status !== "Closed" ? (
                    <form
                      onSubmit={handleSendTicketReply}
                      className="p-4 bg-white border-t border-gray-200 flex gap-2"
                    >
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder="Balas pesan admin di sini..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                      />
                      <button
                        type="submit"
                        disabled={isSendingReply || !replyInput.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                      >
                        {isSendingReply ? "..." : "Kirim"}
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm font-medium">
                      Tiket ini sudah ditutup (Closed). Anda tidak dapat
                      membalas pesan.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-4xl w-full mx-auto bg-gray-50 overflow-y-auto">
            <header className="bg-red-700 text-white p-4 sm:p-5 flex items-center shadow-sm z-10 gap-4">
              <button
                className="p-2 -ml-2 rounded-full hover:bg-red-800 transition focus:outline-none"
                onClick={() => setActiveMenu("chatbot")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <div className="flex-1 text-center pr-8">
                <h2 className="text-lg font-bold">Profil Pengguna</h2>
              </div>
            </header>

            <div className="flex-1 p-6 md:p-12">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Profil */}
                <div className="bg-red-50 p-8 flex flex-col items-center border-b border-gray-100">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src={`https://ui-avatars.com/api/?name=${userName}&background=E11D48&color=fff&size=128&bold=true`}
                      alt="Avatar"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {userName}
                  </h2>
                  <p className="text-red-600 font-semibold text-sm uppercase tracking-widest mt-1">
                    {userRole}
                  </p>
                </div>

                {/* Detail Informasi */}
                <div className="p-8 space-y-6">
                  {/* Baris NIM */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-4">
                    <span className="text-sm text-gray-500 font-medium">
                      Username (NIM/NIP)
                    </span>
                    <span className="text-gray-800 font-bold">{nimNip}</span>
                  </div>

                  {/* Baris Email */}
                  <div className="flex flex-col border-b border-gray-50 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium">
                        Alamat Email
                      </span>
                      {!userEmail && !isEditingEmail && (
                        <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded">
                          Harus Diisi
                        </span>
                      )}
                    </div>

                    {isEditingEmail ? (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newEmailInput}
                          onChange={(e) => setNewEmailInput(e.target.value)}
                          placeholder="nama@email.com"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <button
                          onClick={async () => {
                            if (!newEmailInput.includes("@"))
                              return alert("Format email tidak valid");

                            setIsUpdatingEmail(true);
                            try {
                              // Panggil API untuk simpan ke Database
                              const res = await fetch(
                                "/api/auth/update-email",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    nimNip,
                                    email: newEmailInput,
                                  }),
                                },
                              );

                              const result = await res.json();

                              if (result.status === "success") {
                                setUserEmail(newEmailInput); // Update tampilan layar
                                setIsEditingEmail(false);
                                alert("Email berhasil tersimpan permanen!");
                              } else {
                                alert(result.message);
                              }
                            } catch (err) {
                              alert(
                                "Gagal terhubung ke server untuk update email.",
                              );
                            } finally {
                              setIsUpdatingEmail(false);
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                          disabled={isUpdatingEmail}
                        >
                          {isUpdatingEmail ? "Menyimpan..." : "Simpan"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800">
                          {userEmail || "Belum diatur"}
                        </span>
                        <button
                          onClick={() => {
                            setNewEmailInput(userEmail);
                            setIsEditingEmail(true);
                          }}
                          className="text-red-600 text-sm font-bold hover:underline"
                        >
                          {userEmail ? "Ubah" : "Atur Sekarang"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Opsi Keamanan */}
                  <div className="pt-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Keamanan Akun
                    </h3>
                    <button
                      disabled={!userEmail}
                      onClick={async () => {
                        setPasswordStatus("Sedang memproses permintaan...");
                        try {
                          // Memanggil API Nodemailer yang baru kita buat
                          const res = await fetch("/api/auth/reset-password", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nimNip, email: userEmail }),
                          });

                          const result = await res.json();
                          if (result.status === "success") {
                            setPasswordStatus(
                              `Link konfirmasi telah dikirim ke ${userEmail}. Silakan cek kotak masuk Anda.`,
                            );
                          } else {
                            setPasswordStatus(
                              "Gagal mengirim email. Pastikan data profil benar.",
                            );
                          }
                        } catch (err) {
                          setPasswordStatus(
                            "Terjadi kesalahan jaringan/teknis saat mengirim email.",
                          );
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition shadow-sm ${
                        userEmail
                          ? "bg-gray-800 text-white hover:bg-black"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                        />
                      </svg>
                      Ubah Password
                    </button>

                    {!userEmail && (
                      <p className="text-[10px] text-center text-gray-400 mt-2">
                        *Lengkapi email terlebih dahulu untuk mengaktifkan fitur
                        ubah password
                      </p>
                    )}
                    {passwordStatus && (
                      <p className="text-xs text-center text-green-600 font-medium mt-3 bg-green-50 p-2 rounded-lg">
                        {passwordStatus}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Akun */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="w-full py-3 bg-white text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-50 transition shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* POP-UP FORM RESET PASSWORD */}
      {resetToken && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Buat Password Baru
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Silakan masukkan password baru untuk akun Anda.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsUpdatingPassword(true);
                try {
                  const res = await fetch("/api/auth/update-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: resetToken, newPassword }),
                  });
                  const result = await res.json();

                  if (result.status === "success") {
                    alert("Password berhasil diubah! Silakan login kembali.");
                    // Tutup pop up dan bersihkan URL
                    setResetToken(null);
                    window.history.replaceState({}, document.title, "/");
                  } else {
                    alert(result.message);
                  }
                } catch (err) {
                  alert("Gagal menghubungi server.");
                } finally {
                  setIsUpdatingPassword(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none transition"
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition shadow-md mt-2"
              >
                {isUpdatingPassword ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
