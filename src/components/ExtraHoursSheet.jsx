'use client';

import React, { useRef } from 'react';
import { format, eachDayOfInterval, parseISO, getDay } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function groupWeeksByMonth(from, to) {
  const allDays = eachDayOfInterval({
    start: parseISO(from),
    end: parseISO(to),
  });

  const months = {};
  let currentWeek = [];

  for (let i = 0; i < allDays.length; i++) {
    const day = allDays[i];
    const dayOfWeek = getDay(day); 
    const monthName = format(day, 'MMMM');

    if (!months[monthName]) months[monthName] = [];

    currentWeek.push(day);

    const isEndOfWeek = dayOfWeek === 4;
    const isLastDay = i === allDays.length - 1;
    const nextMonth = i < allDays.length - 1 && format(day, 'MM') !== format(allDays[i + 1], 'MM');

    if (isEndOfWeek || isLastDay || nextMonth) {
      months[monthName].push([...currentWeek]);
      currentWeek = [];
    }
  }

  return months;
}

export default function ExtraHoursSheet({ teacher }) {
  const printRef = useRef();

  const weeksByMonth = groupWeeksByMonth(teacher.from, teacher.to);
  const extraHoursDays = teacher.extraDays;

  function getExtraHoursEntry(date) {
    const formatted = format(date, 'yyyy-MM-dd');
    return extraHoursDays.find(d => d.date === formatted);
  }

  const totalExtraHours = Object.values(weeksByMonth)
    .flat()
    .reduce((sum, week) => {
      return sum + week.reduce((innerSum, d) => {
        const match = getExtraHoursEntry(d);
        return match ? innerSum + Number(match.number_of_hours) : innerSum;
      }, 0);
    }, 0);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    const pageHeight = pdf.internal.pageSize.getHeight();
    let position = 0;

    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
      while (position < pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
        position += pageHeight;
        if (position < pdfHeight) pdf.addPage();
      }
    }

    pdf.save('extra-hours-sheet.pdf');
  };

  return (
    <div className="p-6">
      

      <div ref={printRef} className="bg-white p-6">
        <h1 className="text-center text-lg font-bold mb-4">
          People's Democratic Republic of Algeria<br />
          Ministry of Higher Education and Scientific Research
        </h1>

        <h2 className="text-center text-md font-semibold mb-2">
          Higher School of Computer Science 08 May 1945 - Sidi Bel Abbès
        </h2>

        <div className="mb-4">
          <p>Full Name: {teacher.firstName} {teacher.familyName}</p>
          <p>Rank: {teacher.rank}</p>
          <p>Academic Year: {teacher.academicYear}</p>
          <p>Period: {`${teacher.from} to ${teacher.to}`}</p>
        </div>

        <table className="table-auto w-full border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-1">Month</th>
              <th className="border border-black p-1">Week</th>
              <th className="border border-black p-1">Extra Hours</th>
              <th className="border border-black p-1">Dates</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(weeksByMonth).map(([month, weeks], monthIndex) => (
              <React.Fragment key={monthIndex}>
                {weeks.map((week, weekIndex) => {
                  const validDays = week.filter(d => {
                    const day = getDay(d);
                    return day >= 0 && day <= 4; 
                  });

                  const extraHours = validDays.reduce((sum, d) => {
                    const match = getExtraHoursEntry(d);
                    return match ? sum + Number(match.number_of_hours) : sum;
                  }, 0);

                  const extraDates = validDays
                    .filter(d => getExtraHoursEntry(d))
                    .map(d => format(d, 'dd'));

                  return (
                    <tr key={`${month}-${weekIndex}`}>
                      {weekIndex === 0 && (
                        <td rowSpan={weeks.length} className="border border-black p-1 font-semibold">
                          {month}
                        </td>
                      )}
                      <td className="border border-black p-1">Week {weekIndex + 1}</td>
                      <td className="border border-black p-1">{extraHours}h</td>
                      <td className="border border-black p-1">{extraDates.join(', ')}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="border border-black p-1 font-bold" colSpan={2}>Total {month}</td>
                  <td className="border border-black p-1 font-bold">
                    {
                      weeks.reduce((sum, week) => {
                        return sum + week.reduce((innerSum, d) => {
                          const match = getExtraHoursEntry(d);
                          return match ? innerSum + Number(match.number_of_hours) : innerSum;
                        }, 0);
                      }, 0)
                    }h
                  </td>
                  <td className="border border-black p-1" />
                </tr>
              </React.Fragment>
            ))}
            <tr>
              <td className="border border-black p-1 font-bold" colSpan={2}> Total Hours</td>
              <td className="border border-black p-1 font-bold">{totalExtraHours}h</td>
              <td className="border border-black p-1" />
            </tr>
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p>Director of Studies</p>
            <br /><br />
            <p>_________________</p>
          </div>
          <div>
            <p>Concerned Teachers</p>
            <br /><br />
            <p>_________________</p>
          </div>
          <div>
            <p>Director</p>
            <br /><br />
            <p>_________________</p>
          </div>
        </div>
      </div>
      <div className="mb-4 text-right">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}
