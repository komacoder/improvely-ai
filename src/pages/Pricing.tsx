import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/ui/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plan, useCreateOrderPayme } from '@/modules/plan';
import { useCreateOrderClick } from '@/modules/plan/hooks/usePlans';
import { useGetPlans } from '@/services/planQueries';
import { useGetTrial } from '@/components/hooks/useGetTrial';
import { useUserProfile } from '@/services/paymentMutations';
import { Check, Crown, Star, CreditCard, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Click, Payme } from '@/assets/Payme';

const Pricing = () => {
  const { data, isLoading } = useGetPlans();
  const { user } = useAuthContext();
  const { data: userPlanData } = useGetTrial();
  const { data: userProfileData } = useUserProfile();
  const navigate = useNavigate();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { mutate: createOrder, isPending } = useCreateOrderPayme();
  const {
    mutate: createOrderClick,
    isPending: isPendingClick,
    variables: variablesClick,
  } = useCreateOrderClick();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const plansData = Array.isArray(data) ? data : data?.data || [];
  
  if (!plansData || plansData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">No plans available</h1>
            <p className="text-muted-foreground mt-4">Please check back later.</p>
          </div>
        </main>
      </div>
    );
  }

  const handleGetPremium = (plan: Plan) => {
    if (plan.price === 0) {
      return;
    }
    
    if (!user) {
      navigate('/auth/login');
      return;
    }
    setSelectedPlan(plan);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymePayment = () => {
    if (selectedPlan) {
      createOrder(selectedPlan._id);
      setIsPaymentDialogOpen(false);
    }
  };

  const handleClickPayment = () => {
    if (selectedPlan) {
      createOrderClick(selectedPlan._id);
      setIsPaymentDialogOpen(false);
    }
  };


  // Debug: Log user profile data
  console.log('User Profile Data:', userProfileData);
  console.log('User Plan Data:', userPlanData);

  // Manual refresh function for testing
  const handleRefreshData = () => {
    window.location.reload();
  };

  const plans = plansData.map((plan) => {
    // Get user's current plan from profile data
    const userCurrentPlan = userProfileData?.data?.userPlan;
    const userTrialData = userPlanData;
    
    // Check if this is the current plan
    const isCurrentPlan = userCurrentPlan ? 
      (plan._id === userCurrentPlan.plan._id) : 
      (plan.price === 0 && !userTrialData?.hasPaidPlan); // Freemium is current only if no paid plan
    
    console.log(`Plan ${plan.title}:`, {
      planId: plan._id,
      userPlanId: userCurrentPlan?.plan?._id,
      userTrialPlan: userTrialData?.plan,
      isCurrentPlan,
      hasPaidPlan: userCurrentPlan?.hasPaidPlan || userTrialData?.hasPaidPlan,
      submissionsUsed: userCurrentPlan?.submissionsUsed || userTrialData?.submissionsUsed,
      submissionsLimit: userCurrentPlan?.submissionsLimit || userTrialData?.submissionsLimit
    });
    
    const isFreemium = plan.price === 0;
    const hasPaidPlan = userCurrentPlan?.hasPaidPlan || userTrialData?.hasPaidPlan || false;
    
    // Determine button text based on plan status
    let buttonText = 'Get Premium';
    if (isCurrentPlan) {
      buttonText = 'Current Plan';
    } else if (isFreemium) {
      buttonText = 'Available';
    } else if (hasPaidPlan && plan.price > 0 && !isCurrentPlan) {
      buttonText = 'Upgrade';
    }
    
    return {
      id: plan._id,
      name: plan.title,
      price: plan.price === 0 ? 'Free' : plan.price,
      period: plan.price === 0 ? '' : plan.currency,
      description: plan.description,
      icon: plan.type === 'FREE' ? <Star className="h-6 w-6" /> : <Crown className="h-6 w-6" />,
      features: plan.features,
      buttonText,
      variant: isCurrentPlan ? 'outline' as const : (isFreemium ? 'secondary' as const : 'default' as const),
      popular: plan.isPopular,
      current: isCurrentPlan,
      isLoading: isPending || (isPendingClick && variablesClick === plan._id),
      plan: plan, // Keep reference to original plan data
    };
  });


  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              IELTS Band Uplift - AI-Powered Essay Improvement for Band 7, 8 & 9
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Get personalized IELTS essay improvements that preserve your ideas
              while upgrading your language to Band 7, 8, or 9 standards.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:[&>*]:w-[33%] justify-center gap-8 max-w-6xl mx-auto">
            {plans.map(plan => (
              <Card
                key={plan.name}
                className={`relative shadow-medium ${
                  plan.popular ? 'ring-2 ring-green-500 shadow-strong' : ''
                } ${plan.current ? 'bg-muted/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1 rounded-full">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`inline-flex p-4 rounded-full ${
                        plan.popular
                          ? 'bg-green-100'
                          : plan.current
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div
                        className={`${
                          plan.popular
                            ? 'text-green-600'
                            : plan.current
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {plan.icon}
                      </div>
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.name === 'Single Check'
                            ? 'text-green-600'
                            : plan.popular
                            ? 'text-green-600'
                            : 'text-green-600'
                        }`}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground text-lg">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={plan.current ? 'outline' : plan.variant}
                    size="lg"
                    className={`w-full ${
                      plan.popular
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : ''
                    } ${plan.current ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={plan.current || plan.isLoading || plan.plan.price === 0}
                    onClick={() => handleGetPremium(plan.plan)}
                  >
                    {plan.isLoading ? 'Loading...' : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Choose Payment Method
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Choose a payment method for {selectedPlan?.title} (
              {selectedPlan?.price} {selectedPlan?.currency})
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4">
              <button
                className="border-2 h-12 w-24 rounded-lg border-[#21C55D] flex items-center justify-center "
                onClick={handlePaymePayment}
                disabled={isPending}
              >
                <Payme />
                {isPending && <span className="ml-2">Processing...</span>}
              </button>
              <button
                className="border-2 w-24 h-12 rounded-lg border-[#21C55D] flex items-center justify-center"
                onClick={handleClickPayment}
                disabled={isPendingClick}
              >
                <Click />
                {isPendingClick && <span className="ml-2">Processing...</span>}
              </button>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Pricing;
