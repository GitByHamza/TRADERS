import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sale from '@/models/Sale';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');
        // Format: YYYY-MM-DD or just ISO string. We need Month and Year.

        const targetDate = dateParam ? new Date(dateParam) : new Date();

        await dbConnect();

        const start = startOfMonth(targetDate);
        const end = endOfMonth(targetDate);

        // Aggregate sales by day (YYYY-MM-DD)
        const sales = await Sale.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: "$totalAmount" },
                    profit: { $sum: "$totalProfit" }
                }
            }
        ]);

        // Fill in missing days with 0
        const daysInMonth = eachDayOfInterval({ start, end });

        const chartData = daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = sales.find(s => s._id === dateStr);

            return {
                date: format(day, 'dd MMM'), // e.g. "01 Feb"
                revenue: dayData ? dayData.revenue : 0,
                profit: dayData ? dayData.profit : 0
            };
        });

        return NextResponse.json({ data: chartData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
