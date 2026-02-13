import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
const useStore = create((set, get) => ({

  // handle Admins 



  user: null,
  token: Cookies.get("session") || null,
  isLoading: false,
  error: null,
  empty: false,

  success: null,



  //  Login
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token, userData } = res.data;

      Cookies.set("session", token, { expires: 7 });

      set({ user: userData, token: token });
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Logout

  logout: async () => {
    try {
      await axios.delete("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {

      Cookies.remove("session");
      set({ user: null, token: null });

    }
  },

  //  Get Admin Info
  getAdmin: async () => {
    set({ isLoading: true });
    try {

      const response = await axios.get(`/api/auth/admin`);
      const adminId = response.data.adminId

      const res = await axios.get(`/api/auth/${adminId}`);


      set({ user: res.data.admin });
    } catch (error) {
      console.log("error fetching admin : ", error)
    } finally {
      set({ isLoading: false });
    }
  },

  //  Refresh Token 
  refreshToken: async () => {
    try {
      const res = await axios.post("/api/auth/login");
      const { token, userData } = res.data;

      // Update token and state
      Cookies.set("session", token, { expires: 7 });
      set({ user: userData, token });
    } catch (error) {
      console.error("Failed to refresh token:", error);
      get().logout();
    }
  },
  //delete account 
  deleteAccount: async () => {
    try {
      const token = get().token;
      if (!token) throw new Error("No token found");

      await axios.delete("/api/auth/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });


      Cookies.remove("session");
      set({ user: null, token: null });
    } catch (error) {
      console.error("Failed to delete account:", error);
      set({ error: error.response?.data?.message || "Failed to delete account" });
    }
  },
  //  Update Profile
  updateProfile: async (updatedData) => {
    set({ isLoading: true });
    try {
      const data = get();
      await axios.put("/api/auth/update-profile", updatedData);


      data.getAdmin();
    } catch (error) {
      console.error("Failed to update profile:", error);
      set({ error: error.response?.data?.message || "Failed to update profile" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    set({ isLoading: true, success: null, error: null });
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });

      set({ success: res.data.message || "Lien envoyé avec succès" });

    } catch (err) {
      const message = err.response?.data?.message || 'Échec de l\'envoi du lien';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },



  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, success: null, error: null });
    try {
      const res = await axios.post('/api/auth/reset-password', { token, newPassword });

      if (res.data.status === "SUCCESS") {
        set({ success: res.data.message });
      } else {
        set({ error: res.data.message });
      }

    } catch (err) {
      set({ error: err.response?.data?.message || 'Échec de la réinitialisation du mot de passe' });
    } finally {
      set({ isLoading: false });
    }
  },

  // cloudinary ..........................................................................

  uploidImage: async (image) => {
    set({ isLoading: true });
    try {

      const formData = new FormData();
      formData.append('file', image);

      const response = await axios.post('/api/uploid', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      alert('Upload failed');
    } finally { set({ isLoading: false }); }
  },
  // handle Teachers .....................................................................

  teachers: null,
  filteredTeachers: null,
  getTeachers: async () => {
    set({ isLoading: true });
    const data = get();
    // work 
    try {

      const response = await axios.get(`/api/teachers?adminId=${data.user.admin_id}`);


      set({ teachers: response.data.teachers, filteredTeachers: response.data.teachers, error: true });
      if (!response.data.teachers) { set({ empty: true }); }
    } catch (error) {
      set({ teachers: [], filteredTeachers: [] });



    } finally { set({ isLoading: false }); }
  },

  filterTeachers: (filter) => {
    // work
    const { teachers } = get();
    switch (filter) {
      case "MCA":
        set({ filteredTeachers: teachers.filter(teacher => teacher.rank === "MCA") });
        break;
      case "MCB":
        set({ filteredTeachers: teachers.filter(teacher => teacher.rank === "MCB") });
        break;
      case "PROFESSOR":
        set({ filteredTeachers: teachers.filter(teacher => teacher.rank === "PROFESSOR") });
        break;
      default:
        set({ filteredTeachers: teachers });
        break;
    }
  },


  searchTeacher: async (query) => {
    set({ isLoading: true });
    // work
    const data = get();

    try {

      if (query == "") {
        data.getTeachers();
      }
      else {

        const response = await axios.get(`/api/teachers/search?keyword=${query}&&adminId=${data.user.admin_id}`);
        if (!response.data) { set({ empty: true }) }
        set({ teachers: response.data });
        set({ filteredTeachers: response.data });

      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally { set({ isLoading: false }); }
  },

  addTeacher: async (addedTeacher) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();

      await axios.post(`/api/teachers`, addedTeacher);
      data.getTeachers();

    } catch (error) {
      console.log("Error inserting teacher:", error);
    } finally { set({ isLoading: false }); }
  },


  selectedTeacher: null,
  teacher: {},
  teacherTimeTable: [],
  // work
  selectTeacher: (teacher) => { set({ selectedTeacher: teacher }) },

  // work
  updateStateTeacher: (newTeacher) => { set({ teacher: newTeacher }) },

  // work
  getTeacher: async () => {
    try {
      const data = get();
      const response = await axios.get(`/api/teachers/${data.selectedTeacher}`);

      set({ teacher: response.data });
    } catch (error) {
      console.log("Error fetching teacher:", error);
    }
  },

  updateTeacher: async (updatedTeacher) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();
      await axios.put(`/api/teachers/${data.selectedTeacher}`, updatedTeacher);
      data.getTeachers();
    } catch (error) {
      console.log("Error updating teacher :", error);
    } finally { set({ isLoading: false }); }
  },

  deleteTeacher: async () => {
    set({ isLoading: true });
    // work
    try {
      const data = get()
      await axios.delete(`/api/teachers/${data.selectedTeacher}`);
      data.getTeachers();
    } catch (error) {
      console.log("Error deleting teacher:", error);
    } finally { set({ isLoading: false }); }
  },


  getTeacherTimeTable: async (academicYear, semester) => {
    try {
      const data = get();
      const response = await axios.get(`/api/timetable/${data.selectedTeacher}?semester=${semester}&academicYear=${academicYear}`);
      set({ teacherTimeTable: response.data.timeTable });

    } catch (error) {
      console.log("Error fetching timeTable:", error);
    }
  },

  timeTableOfTeacher: async (teacher, period) => {
    try {

      const data = get();
      const response = await axios.get(`/api/timetable/${teacher}?semester=${period.semester}&academicYear=${period.academicYear}`);
      return response.data.timeTable

    } catch (error) {
      console.log("Error fetching timeTable:", error);
    }
  },







  // handle Absences  .................................................................


  absences: null,

  getAbsences: async () => {
    set({ isLoading: true });
    // work 
    try {
      const data = get()
      const response = await axios.get(`/api/absences?teacherId=${data.selectedTeacher}`);
      set({ absences: response.data.absences });

    } catch (error) {
      set({ absences: [] });
    } finally { set({ isLoading: false }); }
  },

  markAbsence: async (absenceData) => {
    set({ isLoading: true });
    try {
      const data = get()

      // work      
      const response = await axios.post(`/api/absences`, absenceData);
      data.getAbsences();
    } catch (error) {
      console.log("Error inserting absence:", error);
    } finally { set({ isLoading: false }) }
  },


  selectedAbsence: {},
  selectAbsence: (absence) => set({ selectedAbsence: absence }),



  updateAbsence: async (updatedAbsence) => {
    set({ isLoading: true });
    try {
      // work
      const data = get();
      const response = await axios.patch(`/api/absences/${data.selectedAbsence}`, updatedAbsence);
      data.getAbsences();

    } catch (error) {
      console.log("Error updating absence:", error);
    } finally { set({ isLoading: false }); }
  },

  catchUpAbsence: async (absenceId) => {
    set({ isLoading: true });
    try {
      const data = get();

      // work
      const response = await axios.patch(`/api/catch_up_absence/${absenceId}`);
      data.getAbsences();

    } catch (error) {
      console.log("Error catching up absence:", error);
    } finally { set({ isLoading: false }); }
  },

  deleteAbsence: async (absenceId) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();

      const response = await axios.delete(`/api/absences/${absenceId}`);
      data.getAbsences();

    } catch (error) {
      console.log("Error deleting absence:", error);
    } finally { set({ isLoading: false }); }
  },


  // handle Ranks .........................................................................



  historyRank: null,
  getRanks: async () => {
    set({ isLoading: true });
    // work
    try {
      const data = get();
      const response = await axios.get(`/api/ranks-history/${data.selectedTeacher}`);
      set({ historyRank: response.data.ranksHistory });

    } catch (error) {
      set({ historyRank: [] });
    } finally { set({ isLoading: false }); }
  },
  addRank: async (addedRank) => {
    set({ isLoading: true });
    // work
    try {

      const data = get();
      const response = await axios.post(`/api/ranks`, { teacherId: data.selectedTeacher, ...addedRank });
      data.getRanks()
    } catch (error) {
      console.log("Error inserting rank:", error);
    } finally { set({ isLoading: false }); }
  },

  selectedRank: {},
  // work
  selectRank: (rank) => set({ selectedRank: rank }),

  updateRank: async (newRank) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.put(`/api/ranks/${data.selectedRank}`, { newTeacherId: data.selectedTeacher, ...newRank });
      data.getRanks()
    } catch (error) {
      console.log("Error updating rank", error);
    } finally { set({ isLoading: false }); }
  },
  deleteRank: async (rankId) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();

      const response = await axios.delete(`/api/ranks/${rankId}`);
      data.getRanks()
    } catch (error) {
      console.log("Error deleting rank :", error);
    } finally { set({ isLoading: false }); }
  },


  // handle Sessions ............................................................................



  filteredTimeTable: null,
  sessions: null,
  getSessions: async (filter) => {
    set({ isLoading: true });
    try {
      // work
      const response = await axios.get(`/api/timetable?promo=${filter.academicLevel}&academicYear=${filter.academicYear}&semester=${filter.semester}`);
      set({ sessions: response.data.timetable });
      set({ filteredTimeTable: filter })
    } catch (error) {
      set({ sessions: [] });
      set({ filteredTimeTable: [] });
    } finally { set({ isLoading: false }); }
  },
  addSession: async (addedSession) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.post(`/api/sessions`, addedSession);
      data.getSessions(data.filteredTimeTable);
    } catch (error) {
      console.log("Error inserting session:", error);
    } finally { set({ isLoading: false }); }
  },

  selectedSession: null,

  selectSession: (session) => set({ selectedSession: session }),

  updateSession: async (updatedSession) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.put(`/api/sessions/${data.selectedSession}`, updatedSession);
      data.getSessions(data.filteredTimeTable);
    } catch (error) {
      console.log("Error updating session:", error);
    } finally { set({ isLoading: false }); }
  },
  deleteSession: async (sessionId) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.delete(`/api/sessions/${sessionId}`);
      data.getSessions(data.filteredTimeTable);
    } catch (error) {
      console.log("Error deleting session:", error);
    } finally { set({ isLoading: false }); }
  },






  // handle Periods .........................................................................



  periods: [],


  getPeriods: async () => {
    set({ isLoading: true });
    // work
    try {
      const data = get();
      const response = await axios.get(`/api/periods`);
      set({ periods: response.data.periods });

    } catch (error) {
      set({ periods: [] });
    } finally { set({ isLoading: false }); }
  },



  addPeriod: async (addedPeriod) => {
    set({ isLoading: true });
    // work
    try {

      const data = get();
      const response = await axios.post(`/api/periods`, addedPeriod);
      data.getPeriods()
    } catch (error) {
      console.log("Error inserting period:", error);
    } finally { set({ isLoading: false }); }
  },



  updatePeriod: async (periodId, newPeriod) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.put(`/api/periods/${periodId}`, newPeriod);
      data.getPeriods()
    } catch (error) {
      console.log("Error updating period", error);
    } finally { set({ isLoading: false }); }
  },


  deletePeriod: async (periodId) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();

      const response = await axios.delete(`/api/periods/${periodId}`);
      data.getPeriods()
    } catch (error) {
      console.log("Error deleting rank :", error);
    } finally { set({ isLoading: false }); }
  },



  // handle holidays



  holidays: [],
  getCurrentAcademicYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (currentMonth >= 9) {
      return `${currentYear}/${currentYear + 1}`;
    } else if (currentMonth <= 7) {
      return `${currentYear - 1}/${currentYear}`;
    } else {
      return `${currentYear}/${currentYear + 1}`;
    }
  },

  getHolidays: async () => {

    set({ isLoading: true });

    // work
    try {
      const data = get();
      const response = await axios.get(`/api/holidays`);
      set({ holidays: response.data.holidays });

    } catch (error) {
      set({ holidays: [] });
    } finally { set({ isLoading: false }); }
  },



  addHoliday: async (addedHoliday) => {
    set({ isLoading: true });
    // work
    try {

      const data = get();
      const response = await axios.post(`/api/holidays`, addedHoliday);
      data.getHolidays()
    } catch (error) {
      console.log("Error inserting rank:", error);
    } finally { set({ isLoading: false }); }
  },



  updateHoliday: async (holidayId, newHoliday) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.put(`/api/holidays/${holidayId}`, newHoliday);
      data.getHolidays()
    } catch (error) {
      console.log("Error updating holiday", error);
    } finally { set({ isLoading: false }); }
  },


  deleteHoliday: async (holidayId) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();

      const response = await axios.delete(`/api/holidays/${holidayId}`);
      data.getHolidays()
    } catch (error) {
      console.log("Error deleting holiday :", error);
    } finally { set({ isLoading: false }); }
  },


  // sub periods and calculate extra hours 



  getSubPeriods: async (teacherId, academicYear) => {

    set({ isLoading: true });

    // work
    try {
      const data = get();
      const response = await axios.get(`/api/teacher-periods?teacherId=${teacherId}&academicYear=${academicYear}`);


      return response.data.data

    } catch (error) {
      return []
    } finally { set({ isLoading: false }); }
  },




  getExtraHoursSheet: async (infos) => {

    set({ isLoading: true });

    // work
    try {

      const response = await axios.post(`/api/sheets`, infos);


      return response.data
    } catch (error) {
      console.log(error);

      return {}
    } finally { set({ isLoading: false }); }
  },

  recalculateSheet: async (infos) => {

    set({ isLoading: true });

    // work
    try {

      const response = await axios.put(`/api/sheets/${infos.sheetId}`, infos);

      console.log(response.data);

      return response.data
    } catch (error) {
      console.log(error);

      return {}
    } finally { set({ isLoading: false }); }
  },


  getTotalExtraHours: async (type, category, from, to) => {

    set({ isLoading: true });

    // work
    try {

      const response = await axios.get(`/api/sheets/total?type=${type}&category=${category}&from=${from}&to=${to}`);


      return response.data.data
    } catch (error) {
      console.log(error);

      return {}
    } finally { set({ isLoading: false }); }
  },


  // ranks management ............................................................

  ranks: [],

  getRanksList: async () => {

    set({ isLoading: true });

    // work
    try {
      const data = get();
      const response = await axios.get(`/api/manage-ranks`);
      set({ ranks: response.data.ranks })

    } catch (error) {
      set({ ranks: [] })
    } finally { set({ isLoading: false }); }
  },



  addRankInfos: async (addedRank) => {
    set({ isLoading: true });
    // work
    try {

      const data = get();
      console.log(addedRank);

      await axios.post(`/api/manage-ranks`, addedRank);
      data.getRanksList()
    } catch (error) {
      console.log("Error inserting rank:", error);
    } finally { set({ isLoading: false }); }
  },



  updateRankInfos: async (rankId, newRank) => {
    set({ isLoading: true });
    // work 
    try {
      const data = get();
      const response = await axios.put(`/api/manage-ranks/${rankId}`, newRank);
      data.getRanksList()
    } catch (error) {
      console.log("Error updating rank", error);
    } finally { set({ isLoading: false }); }
  },


  deleteRankInfos: async (rankId) => {
    set({ isLoading: true });
    // work
    try {
      const data = get();

      await axios.delete(`/api/manage-ranks/${rankId}`);
      data.getRanksList()
    } catch (error) {
      console.log("Error deleting rank :", error);
    } finally { set({ isLoading: false }); }
  },

  getStatistics: async (from, to) => {

    set({ isLoading: true });

    // work
    try {
      const response = await axios.get(`/api/statistics?from=${from}&to=${to}`);
      return response.data.data


    } catch (error) {
      return {}
    } finally { set({ isLoading: false }); }
  },


}));

export default useStore;


