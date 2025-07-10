import { describe, it, expect } from 'vitest';
import { CourseDoc } from '../../convex/types';

// CSV generation function extracted for testing
const generateCSV = (courses: CourseDoc[]) => {
  const headers = ['Course ID', 'Title', 'Department', 'Instructor', 'Days', 'Time', 'Credits', 'Price Forecast'];
  
  return [
    headers.join(','),
    ...courses.map(course => [
      course.course_id,
      `"${course.title}"`, // Wrap in quotes to handle commas
      course.department,
      course.instructor,
      course.days,
      `${course.start_time} - ${course.end_time}`,
      course.credits,
      course.price_forecast,
    ].join(','))
  ].join('\n');
};

const mockCourses: CourseDoc[] = [
  {
    _id: 'course1' as any,
    _creationTime: Date.now(),
    course_id: 'ACCT6130001',
    title: 'Fundamentals of Financial and Managerial Accounting',
    department: 'ACCT',
    instructor: 'LANE',
    days: 'TR',
    start_time: '10:15',
    end_time: '11:44',
    term: 'Full',
    credits: 1.0,
    price_forecast: 1875,
    price_std_dev: 200,
    course_quality: 2.8,
    instructor_quality: 3.1,
    difficulty: 2.9,
    work_required: 2.5,
  },
  {
    _id: 'course2' as any,
    _creationTime: Date.now(),
    course_id: 'MGMT6110001',
    title: 'Introduction to Management',
    department: 'MGMT',
    instructor: 'SMITH',
    days: 'MW',
    start_time: '09:00',
    end_time: '10:30',
    term: 'Q1',
    credits: 1.5,
    price_forecast: 2000,
    price_std_dev: 150,
    course_quality: 3.2,
    instructor_quality: 3.5,
    difficulty: 2.1,
    work_required: 2.0,
  },
];

describe('CSV Export Functionality', () => {
  it('generates correct CSV headers', () => {
    const csv = generateCSV([]);
    
    expect(csv).toBe('Course ID,Title,Department,Instructor,Days,Time,Credits,Price Forecast');
  });

  it('generates CSV with correct course data', () => {
    const csv = generateCSV(mockCourses);
    
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 courses
    
    // Check header
    expect(lines[0]).toBe('Course ID,Title,Department,Instructor,Days,Time,Credits,Price Forecast');
    
    // Check first course
    expect(lines[1]).toBe('ACCT6130001,"Fundamentals of Financial and Managerial Accounting",ACCT,LANE,TR,10:15 - 11:44,1,1875');
    
    // Check second course
    expect(lines[2]).toBe('MGMT6110001,"Introduction to Management",MGMT,SMITH,MW,09:00 - 10:30,1.5,2000');
  });

  it('handles course titles with commas correctly', () => {
    const courseWithComma: CourseDoc = {
      ...mockCourses[0],
      title: 'Finance, Accounting, and Management',
    };
    
    const csv = generateCSV([courseWithComma]);
    const lines = csv.split('\n');
    
    // Title should be wrapped in quotes
    expect(lines[1]).toContain('"Finance, Accounting, and Management"');
  });

  it('formats time correctly', () => {
    const csv = generateCSV(mockCourses);
    const lines = csv.split('\n');
    
    expect(lines[1]).toContain('10:15 - 11:44');
    expect(lines[2]).toContain('09:00 - 10:30');
  });

  it('handles numeric values correctly', () => {
    const csv = generateCSV(mockCourses);
    const lines = csv.split('\n');
    
    // Credits and price should be unquoted numbers
    expect(lines[1]).toContain(',1,1875');
    expect(lines[2]).toContain(',1.5,2000');
  });

  it('generates CSV for single course', () => {
    const csv = generateCSV([mockCourses[0]]);
    const lines = csv.split('\n');
    
    expect(lines).toHaveLength(2); // header + 1 course
    expect(lines[1]).toBe('ACCT6130001,"Fundamentals of Financial and Managerial Accounting",ACCT,LANE,TR,10:15 - 11:44,1,1875');
  });

  it('generates CSV for filtered courses', () => {
    // Simulate filtering by department
    const filteredCourses = mockCourses.filter(course => course.department === 'ACCT');
    const csv = generateCSV(filteredCourses);
    const lines = csv.split('\n');
    
    expect(lines).toHaveLength(2); // header + 1 course
    expect(lines[1]).toContain('ACCT6130001');
    expect(lines[1]).not.toContain('MGMT6110001');
  });
});