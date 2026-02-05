const dayOrder = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
};
function customRound(num) {
    const intPart = Math.floor(num);
    const decimalPart = num - intPart;

    if (decimalPart === 0) {
        return num;
    } else if (decimalPart <= 0.5) {
        return intPart + 0.5;
    } else {
        return intPart + 1;
    }
}


function sortSessionsByTypeDayTime(sessions) {
    const typeOrder = {
        'Cours': 0,
        'TD': 1,
        'TP': 2
    };

    return sessions.sort((a, b) => {
        const typeA = typeOrder[a.type];
        const typeB = typeOrder[b.type];

        if (typeA !== typeB) {
            return typeA - typeB;
        }

        const dayA = dayOrder[a.day_of_week];
        const dayB = dayOrder[b.day_of_week];

        if (dayA !== dayB) {
            return dayA - dayB;
        }

        if (a.start_time < b.start_time) return -1;
        if (a.start_time > b.start_time) return 1;

        return 0;
    });
}

function isHoliday(dateStr, holidays) {
    return holidays.some(h => new Date(dateStr).getTime() >= new Date(h.from).getTime() && new Date(dateStr).getTime() <= new Date(h.to).getTime())

}

function isAbsent(session, sessionDate, absences) {
    return absences.some(a => a.session_id == session.session_id && a.date == sessionDate && !a.caught_up)
}

export function getExtraSessions(timetable, teacherType, hoursOutside) {
    const typeCoeff = {
        "Cours": 3 / 2,
        "TD": 1,
        "TP": 3 / 4
    }
    let extraSessions = []
    let extraHours
    if (teacherType == "Permanent") {
        if (hoursOutside < 9) {
            let weight = hoursOutside
            let left = 9 - weight
            extraHours = 0
            for (const session of sortSessionsByTypeDayTime(timetable)) {
                const start = new Date(`1970-01-01T${session.start_time}`)
                const end = new Date(`1970-01-01T${session.end_time}`)
                const hours = (end - start) / (1000 * 60 * 60)
                const weighted = hours * (typeCoeff[session.type] || 1)
                left = 9 - weight
                if (weight < 9) {
                    if (weighted <= left) {
                        weight += weighted
                    }
                    else {
                        weight += left
                        if (extraHours < 12) {
                            if (extraHours + hours - left / typeCoeff[session.type] <= 12) {
                                extraHours += hours - left / typeCoeff[session.type]
                                extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(hours - left / typeCoeff[session.type]) })
                            } else {
                                extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(12 - extraHours) })
                                extraHours = 12
                            }
                        }
                    }
                } else {
                    if (extraHours < 12) {
                        if (extraHours + hours <= 12) {
                            extraHours += hours
                            extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(hours) })
                        } else {
                            extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(12 - extraHours) })
                            extraHours = 12
                        }
                    }
                }
            }
        } else {
            extraHours = hoursOutside - 9
            for (const session of sortSessionsByTypeDayTime(timetable)) {
                const start = new Date(`1970-01-01T${session.start_time}`)
                const end = new Date(`1970-01-01T${session.end_time}`)
                const hours = (end - start) / (1000 * 60 * 60)
                if (extraHours < 12) {
                    if (extraHours + hours <= 12) {
                        extraHours += hours
                        extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(hours) })
                    } else {
                        extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(12 - extraHours) })
                        extraHours = 12
                    }

                }
            }
        }
    } else if (teacherType == "Temporary") {
        extraHours = hoursOutside
        for (const session of sortSessionsByTypeDayTime(timetable)) {
            const start = new Date(`1970-01-01T${session.start_time}`)
            const end = new Date(`1970-01-01T${session.end_time}`)
            const hours = (end - start) / (1000 * 60 * 60)
            if (extraHours < 12) {
                if (extraHours + hours <= 12) {
                    extraHours += hours
                    extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(hours) })
                } else {
                    extraSessions.push({ session_id: session.session_id, day_of_week: session.day_of_week, duration: customRound(12 - extraHours) })
                    extraHours = 12
                }

            }
        }
    }
    return extraSessions
}

export function generateDatedSessions(from, to, sessions, holidays = [], absences = []) {
    const result = []
    const current = new Date(from)

    while (current <= to) {
        const day = current.getDay()

        sessions.forEach(session => {
            if (dayOrder[session.day_of_week] === day && !isHoliday(current.toISOString().split('T')[0], holidays) && !isAbsent(session, current.toISOString().split('T')[0], absences)) {
                result.push({
                    session_id: session.session_id,
                    day_of_week: session.day_of_week,
                    duration: session.duration,
                    date: new Date(current).toISOString().split('T')[0],
                })
            }
        })

        current.setDate(current.getDate() + 1)
    }

    return result
}

export function groupSessionsByDate(data) {
    const grouped = data.reduce((acc, session) => {
        if (!acc[session.date]) {
            acc[session.date] = {
                date: session.date,
                day_of_week: session.day_of_week,
                totalDuration: 0
            };
        }
        acc[session.date].totalDuration += session.duration;
        return acc;
    }, {});

    return Object.values(grouped);
}

