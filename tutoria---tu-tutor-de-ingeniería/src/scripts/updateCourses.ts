import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Renaming Cálculo 1...');
  
  const calc1 = await prisma.subject.findFirst({
    where: { name: "Cálculo 1" }
  });

  if (calc1) {
    await prisma.subject.update({
      where: { id: calc1.id },
      data: { name: "Cálculo Diferencial e Integral en una Variable" }
    });
    console.log('Renamed Cálculo 1 successfully.');
  } else {
    console.log('Cálculo 1 not found. Maybe it was already renamed?');
  }

  const newCourses = [
    { name: 'Álgebra Lineal 1', code: 'gal1', description: 'Geometría y Álgebra Lineal 1' },
    { name: 'Matemática Discreta 1', code: 'discreta1', description: 'Matemática Discreta 1' },
    { name: 'Cálculo Diferencial e Integral en Varias Variables', code: 'cdivv', description: 'Cálculo en Varias Variables' }
  ];

  for (const course of newCourses) {
    const existing = await prisma.subject.findFirst({
      where: { name: course.name }
    });
    
    if (!existing) {
      console.log(`Creating ${course.name}...`);
      const newSub = await prisma.subject.create({
        data: {
          name: course.name,
          code: course.code,
          faculty: 'FING',
          description: course.description
        }
      });
      console.log(`Created ${course.name} with ID ${newSub.id}`);
      
      const categories = [
        { name: 'Práctico', type: 'practico', order: 0 },
        { name: 'Primer Parcial', type: 'primer_parcial', order: 1 },
        { name: 'Segundo Parcial', type: 'segundo_parcial', order: 2 },
        { name: 'Examen Final', type: 'examen', order: 3 },
      ];
      
      for (const cat of categories) {
        await prisma.category.create({
          data: {
            name: cat.name,
            type: cat.type,
            order: cat.order,
            subjectId: newSub.id
          }
        });
      }
      console.log(`Added categories for ${course.name}.`);
    } else {
      console.log(`${course.name} already exists.`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
