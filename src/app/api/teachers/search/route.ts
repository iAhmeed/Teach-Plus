import { NextResponse } from 'next/server';
import { database } from '@/lib/mysql';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let keyword = searchParams.get('keyword');
    let adminId = searchParams.get('adminId')

    if (!keyword) {
      return NextResponse.json({ message: 'Keyword is required' }, { status: 400 });
    }

    keyword = keyword.trim();

    let query = `
      SELECT * FROM Teachers
      WHERE first_name LIKE ? OR family_name LIKE ?
         OR CONCAT(first_name, ' ', family_name) LIKE ?
    `;

    let values = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

    let [results] = await database.execute(query, values);

    const filteredResults = results.filter(teacher => teacher.admin_id == adminId);
    let teachersWithRanks = []
    for (const teacher of filteredResults) {
      const [rank] = await database.execute("SELECT rank FROM Ranks_of_teachers WHERE teacher_id = ? AND starting_date >= ALL (SELECT starting_date FROM Ranks_of_teachers WHERE teacher_id = ?) LIMIT 1;", [teacher.teacher_id, teacher.teacher_id])
      if (rank.length) {
        teachersWithRanks.push(Object.assign({}, teacher, rank[0]))
      }
      else {
        teachersWithRanks.push(Object.assign({}, teacher, { rank: null }))
      }
    }

    return NextResponse.json(teachersWithRanks, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
